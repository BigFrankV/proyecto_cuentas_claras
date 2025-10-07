SELECT 
  t.id,
  t.nombre,
  t.codigo,
  t.edificio_id,
  t.created_at AS fechaCreacion,
  t.updated_at AS ultimaActualizacion,
  e.nombre     AS nombreEdificio,
  e.direccion  AS direccionEdificio,
  c.razon_social AS nombreComunidad,
  COUNT(DISTINCT u.id) AS totalUnidades,
  -- Ocupadas: existe titularidad vigente (hasta NULL o futura)
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS unidadesOcupadas,
  -- N° pisos estimado desde prefijo de código (formato 'NN-xxx')
  COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numPisos
FROM torre t
JOIN edificio e       ON e.id = t.edificio_id
JOIN comunidad c      ON c.id = e.comunidad_id
LEFT JOIN unidad u    ON u.torre_id = t.id AND u.activa = 1
WHERE t.edificio_id = 1
GROUP BY t.id, t.nombre, t.codigo, t.edificio_id, t.created_at, t.updated_at,
         e.nombre, e.direccion, c.razon_social
ORDER BY t.codigo ASC;



SELECT 
  t.id,
  t.nombre,
  t.codigo,
  t.created_at AS fechaCreacion,
  COUNT(DISTINCT u.id) AS totalUnidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS unidadesOcupadas
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.edificio_id = 1
  AND (
      @search_term IS NULL OR @search_term = '' OR
      t.nombre COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', @search_term, '%') OR
      t.codigo COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', @search_term, '%')
  )
GROUP BY t.id, t.nombre, t.codigo, t.created_at
ORDER BY 
  CASE WHEN @sort_by='nombre'  AND @sort_order='ASC'  THEN t.nombre END ASC,
  CASE WHEN @sort_by='nombre'  AND @sort_order='DESC' THEN t.nombre END DESC,
  CASE WHEN @sort_by='unidades' AND @sort_order='ASC'  THEN COUNT(DISTINCT u.id) END ASC,
  CASE WHEN @sort_by='unidades' AND @sort_order='DESC' THEN COUNT(DISTINCT u.id) END DESC,
  CASE WHEN @sort_by='fecha'   AND @sort_order='ASC'  THEN t.created_at END ASC,
  CASE WHEN @sort_by='fecha'   AND @sort_order='DESC' THEN t.created_at END DESC,
  t.nombre ASC; -- desempate estable


SELECT 
  COUNT(DISTINCT t.id) AS totalTorres,
  COUNT(DISTINCT u.id) AS totalUnidades,
  COALESCE(ROUND(COUNT(DISTINCT u.id) / NULLIF(COUNT(DISTINCT t.id),0), 0), 0) AS promedioUnidadesPorTorre,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS totalUnidadesOcupadas,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS totalUnidadesVacantes
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.edificio_id = 1;

SELECT 
  t.id,
  t.nombre,
  t.codigo,
  t.edificio_id,
  t.created_at AS fechaCreacion,
  t.updated_at AS ultimaActualizacion,
  e.nombre   AS nombreEdificio,
  e.direccion AS direccionEdificio,
  e.codigo    AS codigoEdificio,
  c.id        AS comunidadId,
  c.razon_social AS nombreComunidad,
  c.direccion AS direccionComunidad,
  COUNT(DISTINCT u.id) AS totalUnidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS unidadesOcupadas,
  COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numPisos,
  COALESCE(SUM(u.m2_utiles), 0) AS superficieTotalUtil,
  COALESCE(SUM(u.m2_terrazas), 0) AS superficieTotalTerrazas,
  COALESCE(SUM(u.m2_utiles + COALESCE(u.m2_terrazas,0)), 0) AS superficieTotal
FROM torre t
JOIN edificio e  ON e.id = t.edificio_id
JOIN comunidad c ON c.id = e.comunidad_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.id = @torre_id
GROUP BY t.id, t.nombre, t.codigo, t.edificio_id, t.created_at, t.updated_at,
         e.nombre, e.direccion, e.codigo, c.id, c.razon_social, c.direccion;




SELECT 
  u.id,
  u.codigo AS numero,
  u.m2_utiles AS superficie,
  u.m2_terrazas,
  u.nro_bodega,
  u.nro_estacionamiento,
  u.alicuota,
  u.activa AS estado,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.unidad_id = u.id
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN 'Ocupada'
    ELSE 'Vacante'
  END AS estadoOcupacion,
  -- Propietarios actuales
  GROUP_CONCAT(
    DISTINCT CASE 
      WHEN tuP.tipo = 'propietario' AND (tuP.hasta IS NULL OR tuP.hasta >= CURRENT_DATE)
      THEN CONCAT(p.nombres, ' ', p.apellidos) 
    END
    SEPARATOR ', '
  ) AS propietarios,
  -- Arrendatarios actuales
  GROUP_CONCAT(
    DISTINCT CASE 
      WHEN tuA.tipo = 'arrendatario' AND (tuA.hasta IS NULL OR tuA.hasta >= CURRENT_DATE)
      THEN CONCAT(pa.nombres, ' ', pa.apellidos) 
    END
    SEPARATOR ', '
  ) AS arrendatarios,
  CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED) AS piso
FROM unidad u
LEFT JOIN titulares_unidad tuP ON tuP.unidad_id = u.id AND tuP.tipo='propietario'
LEFT JOIN persona p            ON p.id = tuP.persona_id
LEFT JOIN titulares_unidad tuA ON tuA.unidad_id = u.id AND tuA.tipo='arrendatario'
LEFT JOIN persona pa           ON pa.id = tuA.persona_id
WHERE u.torre_id = 1
  AND u.activa = 1
GROUP BY u.id, u.codigo, u.m2_utiles, u.m2_terrazas, u.nro_bodega, 
         u.nro_estacionamiento, u.alicuota, u.activa
ORDER BY piso ASC, u.codigo ASC;



SELECT 
  u.id,
  u.codigo AS numero,
  u.m2_utiles AS superficie,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN 'Ocupada'
    ELSE 'Vacante'
  END AS estado,
  GROUP_CONCAT(
    DISTINCT CASE 
      WHEN tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
      THEN CONCAT(p.nombres, ' ', p.apellidos) 
    END 
    SEPARATOR ', '
  ) AS propietarios
FROM unidad u
LEFT JOIN titulares_unidad tu ON tu.unidad_id = u.id AND tu.tipo='propietario'
LEFT JOIN persona p           ON p.id = tu.persona_id
WHERE u.torre_id = 1
  AND u.activa = 1
  AND (
    @estado_filter = 'todas'
    OR (
      @estado_filter = 'ocupada' 
      AND EXISTS (
        SELECT 1 FROM titulares_unidad tu2 
        WHERE tu2.unidad_id = u.id 
          AND (tu2.hasta IS NULL OR tu2.hasta >= CURRENT_DATE)
      )
    )
    OR (
      @estado_filter = 'vacante' 
      AND NOT EXISTS (
        SELECT 1 FROM titulares_unidad tu3 
        WHERE tu3.unidad_id = u.id 
          AND (tu3.hasta IS NULL OR tu3.hasta >= CURRENT_DATE)
      )
    )
  )
GROUP BY u.id, u.codigo, u.m2_utiles
ORDER BY u.codigo ASC;



SELECT 
  CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED) AS piso,
  COUNT(u.id) AS totalUnidades,
  COUNT(CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN 1 
  END) AS unidadesOcupadas,
  SUM(u.m2_utiles) AS superficieTotal,
  AVG(u.m2_utiles) AS superficiePromedio
FROM unidad u
WHERE u.torre_id = 1
  AND u.activa = 1
GROUP BY piso
ORDER BY piso ASC;




SELECT COUNT(*) AS existe
FROM torre
WHERE edificio_id = @edificio_id 
  AND codigo = 'T001'; -- <== cambia aquí si no usas variable

  SELECT 
  e.id,
  e.nombre,
  e.direccion,
  e.codigo,
  c.id AS comunidadId,
  c.razon_social AS nombreComunidad
FROM edificio e
JOIN comunidad c ON c.id = e.comunidad_id
WHERE e.id = @edificio_id;


SELECT 
  CONCAT('T', LPAD(COALESCE(MAX(CAST(SUBSTRING(codigo, 2) AS UNSIGNED)), 0) + 1, 3, '0')) AS siguienteCodigo
FROM torre
WHERE edificio_id = @edificio_id 
  AND codigo REGEXP '^T[0-9]+$';


SELECT 
  t.id AS torre_id,
  t.nombre AS torre_nombre,
  t.codigo AS torre_codigo,
  e.id AS edificio_id,
  e.nombre AS edificio_nombre,
  e.codigo AS edificio_codigo,
  c.id AS comunidad_id,
  c.razon_social AS comunidad_nombre,
  COUNT(DISTINCT u.id) AS total_unidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS unidades_ocupadas,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS unidades_vacantes,
  COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numero_pisos,
  COALESCE(SUM(u.m2_utiles), 0) AS superficie_total_util,
  COALESCE(SUM(u.m2_terrazas), 0) AS superficie_total_terrazas,
  COALESCE(ROUND(AVG(u.m2_utiles), 2), 0) AS superficie_promedio,
  t.created_at AS fecha_creacion,
  t.updated_at AS ultima_actualizacion
FROM torre t
JOIN edificio e  ON e.id = t.edificio_id
JOIN comunidad c ON c.id = e.comunidad_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE (@edificio_id IS NULL OR t.edificio_id = @edificio_id)
  AND (@comunidad_id IS NULL OR c.id = @comunidad_id)
GROUP BY t.id, t.nombre, t.codigo, e.id, e.nombre, e.codigo, 
         c.id, c.razon_social, t.created_at, t.updated_at
ORDER BY c.razon_social, e.nombre, t.codigo;





SELECT 
  t.nombre AS torre,
  t.codigo,
  COUNT(DISTINCT u.id) AS total_unidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS ocupadas,
  ROUND(
    (COUNT(DISTINCT CASE 
       WHEN EXISTS (
         SELECT 1 FROM titulares_unidad tu2 
         WHERE tu2.unidad_id = u.id 
           AND (tu2.hasta IS NULL OR tu2.hasta >= CURRENT_DATE)
       ) THEN u.id 
     END) * 100.0) / NULLIF(COUNT(DISTINCT u.id), 0), 
  2) AS porcentaje_ocupacion
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE (@edificio_id IS NULL OR t.edificio_id = @edificio_id)
GROUP BY t.id, t.nombre, t.codigo
ORDER BY porcentaje_ocupacion DESC;



SELECT 
  t.id,
  t.nombre,
  t.codigo,
  e.nombre AS edificio,
  COUNT(DISTINCT u.id) AS totalUnidades
FROM torre t
JOIN edificio e ON e.id = t.edificio_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE (
  t.nombre COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', @search_term, '%')
  OR t.codigo COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', @search_term, '%')
)
AND (@edificio_id IS NULL OR t.edificio_id = @edificio_id)
GROUP BY t.id, t.nombre, t.codigo, e.nombre
ORDER BY t.nombre ASC
LIMIT 20;


SELECT 
  t.id,
  t.nombre,
  t.codigo,
  CONCAT(t.nombre, ' (', t.codigo, ')') AS display_name
FROM torre t
WHERE t.edificio_id = @edificio_id
ORDER BY t.codigo ASC;


SELECT 
  t.id,
  t.nombre,
  COUNT(u.id) AS total_unidades,
  COUNT(CASE WHEN u.activa = 1 THEN 1 END) AS unidades_activas
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id
WHERE t.id = @torre_id
GROUP BY t.id, t.nombre;




SELECT 
  t.nombre,
  t.codigo,
  e.nombre AS edificio,
  COUNT(DISTINCT u.id) AS totalUnidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS ocupadas
FROM torre t
JOIN edificio e  ON e.id = t.edificio_id
JOIN comunidad c ON c.id = e.comunidad_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE (@edificio_id IS NULL OR t.edificio_id = @edificio_id)
  AND (@comunidad_id IS NULL OR c.id = @comunidad_id)
GROUP BY t.id, t.nombre, t.codigo, e.nombre
ORDER BY totalUnidades DESC
LIMIT 5;



SELECT 
  COUNT(DISTINCT t.id) AS total_torres,
  COUNT(DISTINCT e.id) AS total_edificios,
  COUNT(DISTINCT u.id) AS total_unidades,
  COUNT(DISTINCT CASE 
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu 
      WHERE tu.unidad_id = u.id 
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    ) THEN u.id 
  END) AS total_unidades_ocupadas,
  COALESCE(ROUND(AVG(up.total), 2), 0) AS promedio_unidades_por_torre
FROM torre t
JOIN edificio e  ON e.id = t.edificio_id
JOIN comunidad c ON c.id = e.comunidad_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
LEFT JOIN (
  SELECT torre_id, COUNT(*) AS total
  FROM unidad
  WHERE activa = 1
  GROUP BY torre_id
) AS up ON up.torre_id = t.id
WHERE (@comunidad_id IS NULL OR c.id = @comunidad_id);



SELECT 
  a.id,
  a.accion,
  a.tabla,
  a.valores_anteriores,
  a.valores_nuevos,
  a.created_at AS fecha,
  CONCAT(p.nombres, ' ', p.apellidos) AS usuario,
  a.ip_address
FROM auditoria a
LEFT JOIN usuario u ON u.id = a.usuario_id
LEFT JOIN persona p ON p.id = u.persona_id
WHERE a.tabla = 'torre' 
  AND a.registro_id = @torre_id
ORDER BY a.created_at DESC
LIMIT 50;


SELECT 
  t.id,
  t.nombre,
  t.codigo,
  e.nombre AS edificio,
  t.created_at AS fechaCreacion,
  DATEDIFF(NOW(), t.created_at) AS diasDesdeCreacion,
  COUNT(DISTINCT u.id) AS totalUnidades
FROM torre t
JOIN edificio e ON e.id = t.edificio_id
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL COALESCE(@dias, 30) DAY)
  AND (@edificio_id IS NULL OR t.edificio_id = @edificio_id)
GROUP BY t.id, t.nombre, t.codigo, e.nombre, t.created_at
ORDER BY t.created_at DESC;



SELECT 
  t.nombre AS torre,
  COUNT(u.id) AS total_unidades,
  ROUND(
    (COUNT(u.id) * 100.0) / NULLIF(SUM(COUNT(u.id)) OVER (), 0)
  , 2) AS porcentaje_del_edificio
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.edificio_id = @edificio_id
GROUP BY t.id, t.nombre
ORDER BY total_unidades DESC;



SELECT 
  t.nombre AS torre,
  t.codigo,
  COUNT(u.id) AS total_unidades,
  COALESCE(SUM(u.m2_utiles), 0) AS superficie_total_util,
  COALESCE(SUM(u.m2_terrazas), 0) AS superficie_total_terrazas,
  COALESCE(ROUND(AVG(u.m2_utiles), 2), 0) AS superficie_promedio_util,
  COALESCE(ROUND(AVG(u.m2_terrazas), 2), 0) AS superficie_promedio_terrazas
FROM torre t
LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
WHERE t.edificio_id = @edificio_id
GROUP BY t.id, t.nombre, t.codigo
ORDER BY t.codigo;



