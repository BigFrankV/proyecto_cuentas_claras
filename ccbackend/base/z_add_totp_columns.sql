-- Migration: add TOTP (2FA) support to usuario
ALTER TABLE usuario
  ADD COLUMN totp_secret VARCHAR(255) NULL,
  ADD COLUMN totp_enabled TINYINT(1) NOT NULL DEFAULT 0;

-- Optionally create a table for backup codes (if desired)
CREATE TABLE IF NOT EXISTS usuario_backup_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);
