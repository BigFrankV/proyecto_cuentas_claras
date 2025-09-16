const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const { generateToken, generateTempToken, verifyToken, authenticate } = require('../middleware/auth')

/**
 * GET /auth/me
 * Devuelve datos básicos del usuario y sus membresías (roles por comunidad)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const tokenUser = req.user || {}
    // base del usuario (desde token o lo ya enriquecido por auth middleware)
    let user = {
      id: tokenUser.id,
      username: tokenUser.username,
      email: tokenUser.email,
      persona_id: tokenUser.persona_id || tokenUser.personaId || null,
      is_superadmin: !!tokenUser.is_superadmin
    }

    // asegurar datos frescos desde tabla usuario si tenemos id
    if (user.id) {
      const [rows] = await db.query('SELECT id, username, email, persona_id, is_superadmin FROM usuario WHERE id = ? LIMIT 1', [user.id])
      if (rows && rows[0]) {
        user = { ...user, ...rows[0], is_superadmin: !!rows[0].is_superadmin }
      }
    }

    // cargar membresías si existe persona_id
    user.membresias = []
    if (user.persona_id) {
      const [mrows] = await db.query(
        'SELECT comunidad_id, persona_id, rol, activo FROM membresia_comunidad WHERE persona_id = ?',
        [user.persona_id]
      )
      user.membresias = Array.isArray(mrows) ? mrows : []
      // añadir roles agregados y comunidad_id por defecto para compatibilidad con UI
      const roles = Array.from(new Set(user.membresias.map(m => m.rol).filter(Boolean)))
      user.roles = roles
      user.comunidad_id = user.comunidad_id || (user.membresias[0] && user.membresias[0].comunidad_id) || null
    } else {
      user.roles = user.roles || []
      user.comunidad_id = user.comunidad_id || null
    }

    return res.json(user)
  } catch (err) {
    console.error('GET /auth/me error', err)
    return res.status(500).json({ error: 'server error' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })
  try {
    const [rows] = await db.query('SELECT id, username, hash_password, persona_id, email, is_superadmin FROM usuario WHERE username = ? LIMIT 1', [username])
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' })
    const user = rows[0]
    const ok = await bcrypt.compare(password, user.hash_password || '')
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })

    // generar access token y refresh token (refresh opcional)
    const payload = { id: user.id, username: user.username, persona_id: user.persona_id, is_superadmin: !!user.is_superadmin }
    const accessToken = generateToken(payload)
    const refreshToken = generateTempToken(payload, process.env.REFRESH_EXP || '7d')

    // set cookie httpOnly con refresh
    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000 })

    return res.json({ accessToken })
  } catch (err) {
    console.error('POST /auth/login error', err)
    return res.status(500).json({ error: 'server error' })
  }
})

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken
    if (!token) return res.status(401).json({ error: 'no refresh token' })
    const payload = verifyToken(token)
    if (!payload || !payload.id) return res.status(401).json({ error: 'invalid refresh token' })

    // emitir nuevo access token
    const newAccess = generateToken({ id: payload.id, username: payload.username, persona_id: payload.persona_id, is_superadmin: !!payload.is_superadmin })
    return res.json({ accessToken: newAccess })
  } catch (err) {
    console.error('POST /auth/refresh error', err)
    return res.status(500).json({ error: 'server error' })
  }
})

// POST /auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.clearCookie('refresh_token')
    return res.json({ ok: true })
  } catch (err) {
    console.error('POST /auth/logout error', err)
    return res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
