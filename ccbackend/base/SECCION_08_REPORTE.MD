# 📊 MÓDULO 06: REPORTES Y ANALYTICS

> **Propósito:** Sistema completo de reportería, indicadores de gestión (KPIs), analytics financieros y dashboards ejecutivos

---

## 🎯 CATEGORÍAS DE REPORTES

```
REPORTES FINANCIEROS
├── Estado de Resultados (Ingresos vs Gastos)
├── Flujo de Caja (Cash Flow)
├── Balance de Cuentas por Cobrar
├── Antigüedad de Saldos (Aging)
├── Presupuesto vs Real
└── Proyecciones Financieras

REPORTES OPERACIONALES
├── Ocupación de Unidades
├── Uso de Amenidades
├── Mantenciones Realizadas
├── Tickets de Soporte
└── Proveedores y Contratos

REPORTES LEGALES/REGULATORIOS
├── Certificados de Deuda
├── Certificados de Gastos Comunes
├── Actas de Asambleas
├── Registro de Propietarios
└── Documentos Tributarios

ANALYTICS Y KPIs
├── Tasa de Morosidad
├── Tasa de Recaudación
├── Satisfacción de Residentes
├── Eficiencia Operacional
└── Cumplimiento de SLA
```

---

## 📈 DASHBOARD EJECUTIVO (KPIs PRINCIPALES)

### **KPI 1: Estado Financiero General**

```sql
-- Vista consolidada del estado financiero actual
CREATE VIEW vw_dashboard_financiero AS
SELECT 
  c.id as comunidad_id,
  c.razon_social,
  
  -- INGRESOS DEL MES ACTUAL
  (SELECT COALESCE(SUM(p.monto), 0)
   FROM pago p
   WHERE p.comunidad_id = c.id
     AND MONTH(p.fecha_pago) = MONTH(CURDATE())
     AND YEAR(p.fecha_pago) = YEAR(CURDATE())
     AND p.estado IN ('registrado', 'conciliado')
  ) as ingresos_mes_actual,
  
  -- GASTOS DEL MES ACTUAL
  (SELECT COALESCE(SUM(g.monto), 0)
   FROM gasto g
   WHERE g.comunidad_id = c.id
     AND MONTH(g.fecha) = MONTH(CURDATE())
     AND YEAR(g.fecha) = YEAR(CURDATE())
  ) as gastos_mes_actual,
  
  -- SALDO TOTAL POR COBRAR
  (SELECT COALESCE(SUM(ccu.saldo), 0)
   FROM cuenta_cobro_unidad ccu
   WHERE ccu.comunidad_id = c.id
     AND ccu.saldo > 0
  ) as saldo_total_por_cobrar,
  
  -- MOROSIDAD (saldos vencidos)
  (SELECT COALESCE(SUM(ccu.saldo), 0)
   FROM cuenta_cobro_unidad ccu
   INNER JOIN emision e ON e.id = ccu.emision_id
   WHERE ccu.comunidad_id = c.id
     AND ccu.saldo > 0
     AND e.fecha_vencimiento < CURDATE()
  ) as morosidad_total,
  
  -- TASA DE MOROSIDAD (%)
  ROUND(
    (SELECT COALESCE(SUM(ccu.saldo), 0)
     FROM cuenta_cobro_unidad ccu
     INNER JOIN emision e ON e.id = ccu.emision_id
     WHERE ccu.comunidad_id = c.id
       AND ccu.saldo > 0
       AND e.fecha_vencimiento < CURDATE()
    ) / NULLIF(
      (SELECT COALESCE(SUM(ccu.monto_total), 1)
       FROM cuenta_cobro_unidad ccu
       WHERE ccu.comunidad_id = c.id
      ), 0
    ) * 100, 2
  ) as tasa_morosidad_porcentaje,
  
  -- SALDO EN BANCOS
  (SELECT COALESCE(SUM(cb.saldo_actual), 0)
   FROM cuenta_bancaria cb
   WHERE cb.comunidad_id = c.id
     AND cb.activa = 1
  ) as saldo_bancos,
  
  -- UNIDADES AL DÍA vs MOROSAS
  (SELECT COUNT(DISTINCT ccu.unidad_id)
   FROM cuenta_cobro_unidad ccu
   WHERE ccu.comunidad_id = c.id
     AND ccu.saldo = 0
  ) as unidades_al_dia,
  
  (SELECT COUNT(DISTINCT ccu.unidad_id)
   FROM cuenta_cobro_unidad ccu
   INNER JOIN emision e ON e.id = ccu.emision_id
   WHERE ccu.comunidad_id = c.id
     AND ccu.saldo > 0
     AND e.fecha_vencimiento < CURDATE()
  ) as unidades_morosas,
  
  -- TOTAL UNIDADES ACTIVAS
  (SELECT COUNT(*)
   FROM unidad u
   WHERE u.comunidad_id = c.id
     AND u.activa = 1
  ) as total_unidades

FROM comunidad c;

-- Uso:
SELECT * FROM vw_dashboard_financiero WHERE comunidad_id = ?;
```

**Resultado esperado:**

| Indicador | Valor | Formato |
|-----------|-------|---------|
| Ingresos mes actual | $15.850.000 | CLP |
| Gastos mes actual | $12.300.000 | CLP |
| Saldo por cobrar | $8.500.000 | CLP |
| Morosidad total | $2.100.000 | CLP |
| Tasa de morosidad | 24.7% | % |
| Saldo en bancos | $45.200.000 | CLP |
| Unidades al día | 78 | Cantidad |
| Unidades morosas | 22 | Cantidad |
| Total unidades | 100 | Cantidad |

---

### **KPI 2: Tasa de Recaudación por Período**

```sql
SELECT 
  DATE_FORMAT(em.periodo, '%Y-%m') as periodo,
  em.total_emision as emitido,
  SUM(ccu.pagado) as recaudado,
  SUM(ccu.saldo) as pendiente,
  ROUND(SUM(ccu.pagado) / em.total_emision * 100, 2) as tasa_recaudacion,
  
  -- Desglose
  COUNT(*) as total_unidades,
  COUNT(CASE WHEN ccu.estado = 'pagada' THEN 1 END) as unidades_pagadas,
  COUNT(CASE WHEN ccu.estado = 'vencida' THEN 1 END) as unidades_morosas,
  
  -- Promedios
  AVG(ccu.monto_total) as promedio_emitido_unidad,
  AVG(ccu.pagado) as promedio_pagado_unidad,
  
  -- Proyección de recaudación
  CASE 
    WHEN em.periodo >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    THEN ROUND(SUM(ccu.pagado) + (SUM(ccu.saldo) * 0.7), 0)  -- Proyección 70% de saldo pendiente
    ELSE SUM(ccu.pagado)
  END as recaudacion_proyectada

FROM emision em
INNER JOIN cuenta_cobro_unidad ccu ON ccu.emision_id = em.id
WHERE em.comunidad_id = ?
  AND em.estado IN ('emitida', 'cerrada')
  AND em.periodo >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY em.id, em.periodo, em.total_emision
ORDER BY em.periodo DESC;
```

**Visualización sugerida:** Gráfico de barras apiladas
- Barra verde: Recaudado
- Barra naranja: Pendiente
- Línea: Tasa de recaudación %

---

### **KPI 3: Antigüedad de Saldos (Aging Report)**

```sql
SELECT 
  u.codigo as unidad,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  
  -- Saldo actual
  SUM(CASE 
    WHEN e.fecha_vencimiento >= CURDATE() 
    THEN ccu.saldo ELSE 0 
  END) as saldo_vigente,
  
  -- 1-30 días vencido
  SUM(CASE 
    WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) BETWEEN 1 AND 30 
    THEN ccu.saldo ELSE 0 
  END) as vencido_1_30,
  
  -- 31-60 días vencido
  SUM(CASE 
    WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) BETWEEN 31 AND 60 
    THEN ccu.saldo ELSE 0 
  END) as vencido_31_60,
  
  -- 61-90 días vencido
  SUM(CASE 
    WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) BETWEEN 61 AND 90 
    THEN ccu.saldo ELSE 0 
  END) as vencido_61_90,
  
  -- Más de 90 días vencido
  SUM(CASE 
    WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) > 90 
    THEN ccu.saldo ELSE 0 
  END) as vencido_mas_90,
  
  -- Total deuda
  SUM(ccu.saldo) as deuda_total,
  
  -- Antigüedad promedio
  AVG(DATEDIFF(CURDATE(), e.fecha_vencimiento)) as dias_promedio_mora,
  
  -- Períodos adeudados
  COUNT(ccu.id) as periodos_adeudados,
  
  -- Riesgo crediticio
  CASE 
    WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) > 90 THEN ccu.saldo ELSE 0 END) > 0 
    THEN '🔴 ALTO'
    WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) > 60 THEN ccu.saldo ELSE 0 END) > 0 
    THEN '🟠 MEDIO'
    WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), e.fecha_vencimiento) > 30 THEN ccu.saldo ELSE 0 END) > 0 
    THEN '🟡 BAJO'
    ELSE '🟢 VIGENTE'
  END as riesgo

FROM unidad u
INNER JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id
INNER JOIN emision e ON e.id = ccu.emision_id
INNER JOIN titulares_unidad tu 
  ON tu.unidad_id = u.id 
  AND tu.tipo = 'propietario'
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
INNER JOIN persona p ON p.id = tu.persona_id
WHERE u.comunidad_id = ?
  AND ccu.saldo > 0
GROUP BY u.id, u.codigo, p.nombres, p.apellidos
HAVING deuda_total > 0
ORDER BY vencido_mas_90 DESC, vencido_61_90 DESC, deuda_total DESC;
```

---

### **KPI 4: Estado de Resultados (P&L - Profit & Loss)**

```sql
-- Estado de Resultados comparativo (últimos 12 meses)
SELECT 
  DATE_FORMAT(periodo, '%Y-%m') as mes,
  
  -- INGRESOS
  ingresos_gastos_comunes,
  ingresos_extraordinarios,
  ingresos_amenidades,
  ingresos_multas,
  ingresos_otros,
  (ingresos_gastos_comunes + ingresos_extraordinarios + ingresos_amenidades + ingresos_multas + ingresos_otros) as total_ingresos,
  
  -- EGRESOS
  gastos_operacionales,
  gastos_extraordinarios,
  gastos_administrativos,
  gastos_mantencion,
  gastos_servicios,
  (gastos_operacionales + gastos_extraordinarios + gastos_administrativos + gastos_mantencion + gastos_servicios) as total_egresos,
  
  -- RESULTADO
  (ingresos_gastos_comunes + ingresos_extraordinarios + ingresos_amenidades + ingresos_multas + ingresos_otros) -
  (gastos_operacionales + gastos_extraordinarios + gastos_administrativos + gastos_mantencion + gastos_servicios) as resultado_periodo,
  
  -- MARGEN
  ROUND(
    ((ingresos_gastos_comunes + ingresos_extraordinarios + ingresos_amenidades + ingresos_multas + ingresos_otros) -
    (gastos_operacionales + gastos_extraordinarios + gastos_administrativos + gastos_mantencion + gastos_servicios)) /
    NULLIF((ingresos_gastos_comunes + ingresos_extraordinarios + ingresos_amenidades + ingresos_multas + ingresos_otros), 0) * 100,
    2
  ) as margen_porcentaje

FROM (
  SELECT 
    DATE_FORMAT(fecha, '%Y-%m-01') as periodo,
    
    -- INGRESOS por tipo
    SUM(CASE WHEN tipo_ingreso = 'gastos_comunes' THEN monto ELSE 0 END) as ingresos_gastos_comunes,
    SUM(CASE WHEN tipo_ingreso = 'extraordinario' THEN monto ELSE 0 END) as ingresos_extraordinarios,
    SUM(CASE WHEN tipo_ingreso = 'amenidades' THEN monto ELSE 0 END) as ingresos_amenidades,
    SUM(CASE WHEN tipo_ingreso = 'multas' THEN monto ELSE 0 END) as ingresos_multas,
    SUM(CASE WHEN tipo_ingreso = 'otros' THEN monto ELSE 0 END) as ingresos_otros,
    
    -- EGRESOS por tipo
    SUM(CASE WHEN tipo_egreso = 'operacional' THEN monto ELSE 0 END) as gastos_operacionales,
    SUM(CASE WHEN tipo_egreso = 'extraordinario' THEN monto ELSE 0 END) as gastos_extraordinarios,
    SUM(CASE WHEN tipo_egreso = 'administrativo' THEN monto ELSE 0 END) as gastos_administrativos,
    SUM(CASE WHEN tipo_egreso = 'mantencion' THEN monto ELSE 0 END) as gastos_mantencion,
    SUM(CASE WHEN tipo_egreso = 'servicios' THEN monto ELSE 0 END) as gastos_servicios
    
  FROM (
    -- INGRESOS (pagos)
    SELECT 
      p.fecha_pago as fecha,
      p.monto,
      'gastos_comunes' as tipo_ingreso,
      NULL as tipo_egreso
    FROM pago p
    WHERE p.comunidad_id = ?
      AND p.estado IN ('registrado', 'conciliado')
      AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    
    UNION ALL
    
    -- EGRESOS (gastos)
    SELECT 
      g.fecha,
      g.monto,
      NULL as tipo_ingreso,
      cg.tipo as tipo_egreso
    FROM gasto g
    INNER JOIN categoria_gasto cg ON cg.id = g.categoria_id
    WHERE g.comunidad_id = ?
      AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  ) movimientos
  GROUP BY DATE_FORMAT(fecha, '%Y-%m-01')
) resultados
ORDER BY periodo DESC;
```

---

### **KPI 5: Flujo de Caja (Cash Flow)**

```sql
-- Flujo de caja con saldo acumulado
SELECT 
  @saldo_acumulado := COALESCE(@saldo_acumulado, 0) + ingresos - egresos as saldo_acumulado,
  periodo,
  ingresos,
  egresos,
  ingresos - egresos as flujo_neto
FROM (
  SELECT 
    DATE_FORMAT(fecha, '%Y-%m-01') as periodo,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as egresos
  FROM (
    -- Ingresos
    SELECT fecha_pago as fecha, monto, 'ingreso' as tipo
    FROM pago
    WHERE comunidad_id = ?
      AND estado IN ('registrado', 'conciliado')
      AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    
    UNION ALL
    
    -- Egresos
    SELECT fecha, monto, 'egreso' as tipo
    FROM gasto
    WHERE comunidad_id = ?
      AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  ) movimientos
  GROUP BY DATE_FORMAT(fecha, '%Y-%m-01')
  ORDER BY periodo
) flujo
CROSS JOIN (SELECT @saldo_acumulado := 0) vars;
```

---

### **KPI 6: Uso de Amenidades**

```sql
SELECT 
  a.nombre as amenidad,
  a.tipo,
  
  -- Estadísticas generales
  COUNT(r.id) as total_reservas,
  COUNT(DISTINCT r.unidad_id) as unidades_distintas,
  COUNT(CASE WHEN r.estado = 'completada' THEN 1 END) as reservas_completadas,
  COUNT(CASE WHEN r.estado = 'cancelada' THEN 1 END) as reservas_canceladas,
  COUNT(CASE WHEN r.estado = 'no_presentado' THEN 1 END) as no_presentados,
  
  -- Tasas
  ROUND(COUNT(CASE WHEN r.estado = 'completada' THEN 1 END) / COUNT(r.id) * 100, 2) as tasa_uso_efectivo,
  ROUND(COUNT(CASE WHEN r.estado = 'cancelada' THEN 1 END) / COUNT(r.id) * 100, 2) as tasa_cancelacion,
  
  -- Ocupación
  SUM(TIMESTAMPDIFF(HOUR, r.fecha_inicio, r.fecha_fin)) as horas_reservadas_total,
  AVG(TIMESTAMPDIFF(HOUR, r.fecha_inicio, r.fecha_fin)) as horas_promedio_reserva,
  
  -- Ingresos
  SUM(r.monto_cobrado) as ingresos_totales,
  AVG(r.monto_cobrado) as ingreso_promedio_reserva,
  
  -- Ocupación promedio
  AVG(r.cantidad_personas) as personas_promedio,
  
  -- Día más popular
  (SELECT DAYNAME(fecha_inicio)
   FROM reserva
   WHERE amenidad_id = a.id
   GROUP BY DAYOFWEEK(fecha_inicio)
   ORDER BY COUNT(*) DESC
   LIMIT 1
  ) as dia_mas_popular,
  
  -- Hora más popular
  (SELECT CONCAT(HOUR(fecha_inicio), ':00')
   FROM reserva
   WHERE amenidad_id = a.id
   GROUP BY HOUR(fecha_inicio)
   ORDER BY COUNT(*) DESC
   LIMIT 1
  ) as hora_mas_popular

FROM amenidad a
LEFT JOIN reserva r 
  ON r.amenidad_id = a.id
  AND r.fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
WHERE a.comunidad_id = ?
  AND a.activa = 1
GROUP BY a.id, a.nombre, a.tipo
ORDER BY total_reservas DESC;
```

---

### **KPI 7: Desempeño de Tickets (Soporte)**

```sql
SELECT 
  -- Resumen general
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN estado = 'abierto' THEN 1 END) as abiertos,
  COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
  COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados,
  
  -- Prioridades
  COUNT(CASE WHEN prioridad = 'urgente' THEN 1 END) as urgentes,
  COUNT(CASE WHEN prioridad = 'alta' THEN 1 END) as altas,
  COUNT(CASE WHEN prioridad = 'media' THEN 1 END) as medias,
  COUNT(CASE WHEN prioridad = 'baja' THEN 1 END) as bajas,
  
  -- Tiempos promedio
  AVG(TIMESTAMPDIFF(HOUR, fecha_reporte, fecha_asignacion)) as horas_promedio_asignacion,
  AVG(TIMESTAMPDIFF(HOUR, fecha_reporte, fecha_resolucion)) as horas_promedio_resolucion,
  AVG(TIMESTAMPDIFF(HOUR, fecha_resolucion, fecha_cierre)) as horas_promedio_cierre,
  
  -- Cumplimiento SLA
  COUNT(CASE 
    WHEN fecha_asignacion IS NOT NULL 
      AND TIMESTAMPDIFF(HOUR, fecha_reporte, fecha_asignacion) <= (
        SELECT tiempo_respuesta_horas FROM categoria_ticket WHERE id = ticket.categoria_id
      )
    THEN 1 
  END) as tickets_sla_cumplido,
  
  ROUND(
    COUNT(CASE 
      WHEN fecha_asignacion IS NOT NULL 
        AND TIMESTAMPDIFF(HOUR, fecha_reporte, fecha_asignacion) <= (
          SELECT tiempo_respuesta_horas FROM categoria_ticket WHERE id = ticket.categoria_id
        )
      THEN 1 
    END) / COUNT(*) * 100,
    2
  ) as porcentaje_sla_cumplido,
  
  -- Satisfacción
  AVG(calificacion) as calificacion_promedio,
  COUNT(CASE WHEN calificacion >= 4 THEN 1 END) as calificaciones_positivas,
  
  -- Costos
  SUM(costo_real) as costo_total_reparaciones,
  AVG(costo_real) as costo_promedio_ticket

FROM ticket
WHERE comunidad_id = ?
  AND fecha_reporte >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
```

---

### **KPI 8: Top 10 Gastos por Categoría**

```sql
SELECT 
  cg.nombre as categoria,
  cg.tipo,
  COUNT(g.id) as cantidad_gastos,
  SUM(g.monto) as total_gastado,
  AVG(g.monto) as promedio_gasto,
  MIN(g.monto) as gasto_minimo,
  MAX(g.monto) as gasto_maximo,
  
  -- Participación
  ROUND(SUM(g.monto) / (
    SELECT SUM(monto) 
    FROM gasto 
    WHERE comunidad_id = ? 
      AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  ) * 100, 2) as porcentaje_total,
  
  -- Tendencia (comparar últimos 6 meses vs 6 anteriores)
  SUM(CASE 
    WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
    THEN g.monto ELSE 0 
  END) as ultimos_6_meses,
  
  SUM(CASE 
    WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) 
      AND g.fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    THEN g.monto ELSE 0 
  END) as anteriores_6_meses,
  
  ROUND(
    (SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN g.monto ELSE 0 END) -
     SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN g.monto ELSE 0 END)) /
    NULLIF(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) THEN g.monto ELSE 0 END), 0) * 100,
    2
  ) as variacion_porcentual

FROM gasto g
INNER JOIN categoria_gasto cg ON cg.id = g.categoria_id
WHERE g.comunidad_id = ?
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY cg.id, cg.nombre, cg.tipo
ORDER BY total_gastado DESC
LIMIT 10;
```

---

## 📄 REPORTES LEGALES

### **R1: Certificado de Deuda**

```sql
-- Certificado oficial de deuda de una unidad
SELECT 
  c.razon_social as comunidad,
  c.rut || '-' || c.dv as rut_comunidad,
  c.direccion as direccion_comunidad,
  
  u.codigo as unidad,
  u.direccion as direccion_unidad,
  
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  p.rut || '-' || p.dv as rut_propietario,
  
  -- Detalle de deuda
  SUM(ccu.saldo) as deuda_total,
  SUM(CASE WHEN e.fecha_vencimiento < CURDATE() THEN ccu.saldo ELSE 0 END) as deuda_vencida,
  SUM(CASE WHEN e.fecha_vencimiento >= CURDATE() THEN ccu.saldo ELSE 0 END) as deuda_vigente,
  
  -- Períodos adeudados
  GROUP_CONCAT(
    CONCAT(DATE_FORMAT(e.periodo, '%m/%Y'), ': $', FORMAT(ccu.saldo, 0))
    ORDER BY e.periodo
    SEPARATOR ' | '
  ) as detalle_periodos,
  
  COUNT(ccu.id) as cantidad_periodos_adeudados,
  MIN(e.periodo) as periodo_mas_antiguo,
  MAX(e.periodo) as periodo_mas_reciente,
  
  -- Intereses y recargos calculados
  SUM(CASE 
    WHEN e.fecha_vencimiento < CURDATE() 
    THEN ROUND(ccu.saldo * (e.recargo_mora / 100) * (DATEDIFF(CURDATE(), e.fecha_vencimiento) / 30), 0)
    ELSE 0 
  END) as intereses_mora_calculados,
  
  -- Total con intereses
  SUM(ccu.saldo) + SUM(CASE 
    WHEN e.fecha_vencimiento < CURDATE() 
    THEN ROUND(ccu.saldo * (e.recargo_mora / 100) * (DATEDIFF(CURDATE(), e.fecha_vencimiento) / 30), 0)
    ELSE 0 
  END) as total_con_intereses,
  
  CURDATE() as fecha_emision_certificado,
  DATE_ADD(CURDATE(), INTERVAL 30 DAY) as fecha_validez_certificado

FROM unidad u
INNER JOIN comunidad c ON c.id = u.comunidad_id
INNER JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id
INNER JOIN emision e ON e.id = ccu.emision_id
INNER JOIN titulares_unidad tu 
  ON tu.unidad_id = u.id 
  AND tu.tipo = 'propietario'
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
INNER JOIN persona p ON p.id = tu.persona_id
WHERE u.id = ?
  AND ccu.saldo > 0
GROUP BY 
  c.id, c.razon_social, c.rut, c.dv, c.direccion,
  u.id, u.codigo, u.direccion,
  p.id, p.nombres, p.apellidos, p.rut, p.dv;
```

---

### **R2: Certificado de Gastos Comunes al Día**

```sql
-- Certificado de que la unidad está al día en sus pagos
SELECT 
  c.razon_social as comunidad,
  c.rut || '-' || c.dv as rut_comunidad,
  
  u.codigo as unidad,
  
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  p.rut || '-' || p.dv as rut_propietario,
  
  -- Verificar que NO tenga deuda
  COALESCE(SUM(ccu.saldo), 0) as saldo_pendiente,
  
  CASE 
    WHEN COALESCE(SUM(ccu.saldo), 0) = 0 
    THEN 'CERTIFICO que la unidad indicada se encuentra AL DÍA en el pago de sus gastos comunes a la fecha.'
    ELSE CONCAT('La unidad indicada mantiene un saldo pendiente de $', FORMAT(SUM(ccu.saldo), 0))
  END as certificacion,
  
  -- Últimos 6 períodos pagados
  (SELECT GROUP_CONCAT(
      CONCAT(DATE_FORMAT(e2.periodo, '%m/%Y'), ': ✓')
      ORDER BY e2.periodo DESC
      SEPARATOR ' | '
    )
   FROM cuenta_cobro_unidad ccu2
   INNER JOIN emision e2 ON e2.id = ccu2.emision_id
   WHERE ccu2.unidad_id = u.id
     AND ccu2.estado = 'pagada'
   ORDER BY e2.periodo DESC
   LIMIT 6
  ) as ultimos_pagos,
  
  CURDATE() as fecha_emision,
  DATE_ADD(CURDATE(), INTERVAL 60 DAY) as validez_hasta

FROM unidad u
INNER JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id AND ccu.saldo > 0
INNER JOIN titulares_unidad tu 
  ON tu.unidad_id = u.id 
  AND tu.tipo = 'propietario'
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
INNER JOIN persona p ON p.id = tu.persona_id
WHERE u.id = ?
GROUP BY 
  c.id, c.razon_social, c.rut, c.dv,
  u.id, u.codigo,
  p.id, p.nombres, p.apellidos, p.rut, p.dv;
```

---

### **R3: Registro de Propietarios Actualizado**

```sql
-- Listado oficial de propietarios vigentes
SELECT 
  u.codigo as unidad,
  u.tipo_unidad,
  u.alicuota,
  
  -- Propietario actual
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  p.rut || '-' || p.dv as rut,
  p.email,
  p.telefono,
  p.direccion,
  tu.desde as fecha_adquisicion,
  DATEDIFF(CURDATE(), tu.desde) as dias_como_propietario,
  
  -- Estado financiero
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM cuenta_cobro_unidad ccu
      INNER JOIN emision e ON e.id = ccu.emision_id
      WHERE ccu.unidad_id = u.id
        AND ccu.saldo > 0
        AND e.fecha_vencimiento < CURDATE()
    )
    THEN '❌ MOROSO'
    ELSE '✅ AL DÍA'
  END as estado_pagos,
  
  COALESCE((
    SELECT SUM(ccu.saldo)
    FROM cuenta_cobro_unidad ccu
    WHERE ccu.unidad_id = u.id
  ), 0) as deuda_total,
  
  -- Arrendatario (si existe)
  COALESCE(CONCAT(pa.nombres, ' ', pa.apellidos), '-') as arrendatario,
  COALESCE(pa.email, '-') as email_arrendatario,
  COALESCE(tua.desde, NULL) as arriendo_desde

FROM unidad u
INNER JOIN titulares_unidad tu 
  ON tu.unidad_id = u.id 
  AND tu.tipo = 'propietario'
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
INNER JOIN persona p ON p.id = tu.persona_id
LEFT JOIN titulares_unidad tua 
  ON tua.unidad_id = u.id 
  AND tua.tipo = 'arrendatario'
  AND (tua.hasta IS NULL OR tua.hasta >= CURDATE())
LEFT JOIN persona pa ON pa.id = tua.persona_id
WHERE u.comunidad_id = ?
  AND u.activa = 1
ORDER BY u.codigo;
```

---

## 📊 VISUALIZACIONES SUGERIDAS

### **Dashboard Principal (Executive Summary)**

```
┌──────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD EJECUTIVO - [Nombre Comunidad]                 │
│  Período: Octubre 2025                                       │
└──────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬────────────────┬──────────┐
│ 💰 INGRESOS    │ 📉 GASTOS      │ 💳 SALDO       │ 📈 MORA  │
│                │                │                │          │
│ $15.850.000    │ $12.300.000    │ $45.200.000    │ 24.7%    │
│ ▲ +8.5%        │ ▼ -3.2%        │ ▲ +12.1%       │ ▼ -2.3%  │
└────────────────┴────────────────┴────────────────┴──────────┘

┌──────────────────────────────────────┬──────────────────────┐
│ 📊 TASA DE RECAUDACIÓN (12 meses)    │  🏠 UNIDADES         │
│                                      │                      │
│  100%│                               │  Total: 100          │
│   90%│     ████                      │  Al día: 78 (78%)    │
│   80%│  ████████████                 │  Morosas: 22 (22%)   │
│   70%│████████████████████           │                      │
│   60%│                               │  🎯 Meta: 85%        │
│      └────────────────────────       │  ✅ Cumplimiento: 92%│
│       E F M A M J J A S O N D        │                      │
└──────────────────────────────────────┴──────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🔥 ALERTAS Y ACCIONES REQUERIDAS                             │
├──────────────────────────────────────────────────────────────┤
│ 🔴 5 tickets urgentes sin asignar                            │
│ 🟠 Mantención ascensores vencida (3 días)                    │
│ 🟡 22 unidades con mora mayor a 60 días                      │
│ 🟢 Recaudación octubre: 92% (sobre meta)                     │
└──────────────────────────────────────────────────────────────┘
```

---

### **Gráfico: Evolución de Morosidad**

```sql
-- Datos para gráfico de línea temporal
SELECT 
  DATE_FORMAT(e.periodo, '%Y-%m') as mes,
  ROUND(
    SUM(CASE WHEN ccu.saldo > 0 AND e.fecha_vencimiento < CURDATE() THEN ccu.saldo ELSE 0 END) /
    NULLIF(SUM(ccu.monto_total), 0) * 100,
    2
  ) as tasa_morosidad,
  SUM(CASE WHEN ccu.saldo > 0 AND e.fecha_vencimiento < CURDATE() THEN ccu.saldo ELSE 0 END) as monto_moroso,
  COUNT(DISTINCT CASE WHEN ccu.saldo > 0 AND e.fecha_vencimiento < CURDATE() THEN ccu.unidad_id END) as unidades_morosas
FROM emision e
INNER JOIN cuenta_cobro_unidad ccu ON ccu.emision_id = e.id
WHERE e.comunidad_id = ?
  AND e.periodo >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(e.periodo, '%Y-%m')
ORDER BY mes;
```

**Visualización:** Gráfico de línea con doble eje Y
- Eje Y izquierdo: % morosidad
- Eje Y derecho: Cantidad de unidades morosas
- Línea de tendencia

---

### **Gráfico: Distribución de Gastos (Pie Chart)**

```sql
-- Datos para gráfico circular
SELECT 
  cg.nombre as categoria,
  SUM(g.monto) as total,
  COUNT(g.id) as cantidad
FROM gasto g
INNER JOIN categoria_gasto cg ON cg.id = g.categoria_id
WHERE g.comunidad_id = ?
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY cg.id, cg.nombre
ORDER BY total DESC
LIMIT 8;  -- Top 8 categorías
```

---

### **Gráfico: Comparativo Presupuesto vs Real**

```sql
-- Comparar presupuesto aprobado vs gasto real
SELECT 
  cg.nombre as categoria,
  
  -- Presupuesto anual (dividido en 12)
  COALESCE((
    SELECT pb.monto_mensual
    FROM presupuesto_categoria pb
    INNER JOIN presupuesto p ON p.id = pb.presupuesto_id
    WHERE pb.categoria_id = cg.id
      AND p.anio = YEAR(CURDATE())
      AND p.estado = 'aprobado'
  ), 0) as presupuesto_mensual,
  
  -- Gasto real del mes
  COALESCE((
    SELECT SUM(g.monto)
    FROM gasto g
    WHERE g.categoria_id = cg.id
      AND MONTH(g.fecha) = MONTH(CURDATE())
      AND YEAR(g.fecha) = YEAR(CURDATE())
  ), 0) as gasto_real_mes,
  
  -- Variación
  COALESCE((
    SELECT SUM(g.monto)
    FROM gasto g
    WHERE g.categoria_id = cg.id
      AND MONTH(g.fecha) = MONTH(CURDATE())
      AND YEAR(g.fecha) = YEAR(CURDATE())
  ), 0) - COALESCE((
    SELECT pb.monto_mensual
    FROM presupuesto_categoria pb
    INNER JOIN presupuesto p ON p.id = pb.presupuesto_id
    WHERE pb.categoria_id = cg.id
      AND p.anio = YEAR(CURDATE())
      AND p.estado = 'aprobado'
  ), 0) as diferencia,
  
  -- Porcentaje de ejecución
  ROUND(
    COALESCE((
      SELECT SUM(g.monto)
      FROM gasto g
      WHERE g.categoria_id = cg.id
        AND MONTH(g.fecha) = MONTH(CURDATE())
        AND YEAR(g.fecha) = YEAR(CURDATE())
    ), 0) / NULLIF(COALESCE((
      SELECT pb.monto_mensual
      FROM presupuesto_categoria pb
      INNER JOIN presupuesto p ON p.id = pb.presupuesto_id
      WHERE pb.categoria_id = cg.id
        AND p.anio = YEAR(CURDATE())
        AND p.estado = 'aprobado'
    ), 1), 0) * 100,
    2
  ) as porcentaje_ejecucion

FROM categoria_gasto cg
WHERE cg.comunidad_id = ?
  AND cg.tipo IN ('operacional', 'mantencion')
ORDER BY cg.nombre;
```

**Visualización:** Gráfico de barras horizontales agrupadas
- Barra azul: Presupuesto
- Barra verde/roja: Real (verde si bajo presupuesto, roja si sobrepasado)

---

## 📧 EXPORTACIÓN Y AUTOMATIZACIÓN

### **Configuración de Reportes Automáticos**

```sql
-- Tabla para programar reportes automáticos
CREATE TABLE reporte_programado (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  comunidad_id BIGINT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo_reporte ENUM(
    'dashboard_ejecutivo',
    'estado_resultados',
    'morosidad',
    'tickets',
    'amenidades',
    'flujo_caja'
  ) NOT NULL,
  frecuencia ENUM('diaria','semanal','mensual','trimestral') NOT NULL,
  dia_semana TINYINT COMMENT '0=Domingo, 6=Sábado',
  dia_mes TINYINT COMMENT '1-31',
  hora_envio TIME DEFAULT '08:00:00',
  formato_salida ENUM('pdf','excel','csv','email_html') NOT NULL,
  destinatarios JSON COMMENT '["email1@example.com", "email2@example.com"]',
  parametros JSON COMMENT 'Filtros y configuraciones específicas',
  activo TINYINT DEFAULT 1,
  ultima_ejecucion DATETIME,
  proxima_ejecucion DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (comunidad_id) REFERENCES comunidad(id)
);

-- Ejemplo: Reporte mensual de morosidad
INSERT INTO reporte_programado (
  comunidad_id,
  nombre,
  tipo_reporte,
  frecuencia,
  dia_mes,
  hora_envio,
  formato_salida,
  destinatarios,
  activo
) VALUES (
  1,
  'Reporte Mensual de Morosidad',
  'morosidad',
  'mensual',
  1,  -- Día 1 de cada mes
  '09:00:00',
  'pdf',
  '["admin@comunidad.cl", "tesorero@comunidad.cl"]',
  1
);
```

---

### **Función: Generar Reporte en Tiempo Real**

```sql
DELIMITER $$
CREATE PROCEDURE sp_generar_reporte_ejecutivo(
  IN p_comunidad_id BIGINT,
  IN p_fecha_desde DATE,
  IN p_fecha_hasta DATE
)
BEGIN
  -- Dashboard Ejecutivo Consolidado
  
  SELECT 'RESUMEN_FINANCIERO' as seccion;
  SELECT * FROM vw_dashboard_financiero WHERE comunidad_id = p_comunidad_id;
  
  SELECT 'ESTADO_RESULTADOS' as seccion;
  -- Query de P&L aquí...
  
  SELECT 'MOROSIDAD' as seccion;
  -- Query de aging aquí...
  
  SELECT 'TICKETS' as seccion;
  -- Query de KPIs de soporte aquí...
  
  SELECT 'AMENIDADES' as seccion;
  -- Query de uso de amenidades aquí...
  
END$$
DELIMITER ;

-- Uso:
CALL sp_generar_reporte_ejecutivo(1, '2025-01-01', '2025-12-31');
```

---

## 🔄 QUERIES DE APOYO PARA DASHBOARDS

### **Indicadores Comparativos (MoM - Month over Month)**

```sql
SELECT 
  'Ingresos' as indicador,
  
  -- Mes actual
  (SELECT SUM(monto)
   FROM pago
   WHERE comunidad_id = ?
     AND MONTH(fecha_pago) = MONTH(CURDATE())
     AND YEAR(fecha_pago) = YEAR(CURDATE())
  ) as mes_actual,
  
  -- Mes anterior
  (SELECT SUM(monto)
   FROM pago
   WHERE comunidad_id = ?
     AND MONTH(fecha_pago) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
     AND YEAR(fecha_pago) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  ) as mes_anterior,
  
  -- Variación
  ROUND(
    ((SELECT SUM(monto) FROM pago WHERE comunidad_id = ? AND MONTH(fecha_pago) = MONTH(CURDATE()) AND YEAR(fecha_pago) = YEAR(CURDATE())) -
     (SELECT SUM(monto) FROM pago WHERE comunidad_id = ? AND MONTH(fecha_pago) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha_pago) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))) /
    NULLIF((SELECT SUM(monto) FROM pago WHERE comunidad_id = ? AND MONTH(fecha_pago) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha_pago) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))), 0) * 100,
    2
  ) as variacion_porcentual

UNION ALL

SELECT 
  'Gastos',
  (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())),
  (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))),
  ROUND(
    ((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())) -
     (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))) /
    NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))), 0) * 100,
    2
  );
```

---

### **Proyección Financiera (Próximos 6 Meses)**

```sql
-- Proyección basada en promedios históricos
SELECT 
  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL n MONTH), '%Y-%m') as mes_proyectado,
  
  -- Ingreso promedio últimos 6 meses
  (SELECT AVG(total_mes)
   FROM (
     SELECT SUM(monto) as total_mes
     FROM pago
     WHERE comunidad_id = ?
       AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m')
   ) ingresos_historicos
  ) as ingreso_proyectado,
  
  -- Gasto promedio últimos 6 meses
  (SELECT AVG(total_mes)
   FROM (
     SELECT SUM(monto) as total_mes
     FROM gasto
     WHERE comunidad_id = ?
       AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(fecha, '%Y-%m')
   ) gastos_historicos
  ) as gasto_proyectado,
  
  -- Flujo neto proyectado
  (SELECT AVG(total_mes) FROM (SELECT SUM(monto) as total_mes FROM pago WHERE comunidad_id = ? AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m')) i) -
  (SELECT AVG(total_mes) FROM (SELECT SUM(monto) as total_mes FROM gasto WHERE comunidad_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(fecha, '%Y-%m')) g) as flujo_neto_proyectado

FROM (
  SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) meses;
```

---

## 📤 EXPORTACIÓN A EXCEL/CSV

### **Estructura de Exportación Estándar**

```javascript
// Ejemplo conceptual de cómo exportar (implementación en backend)

// Función para exportar reporte a Excel
async function exportarReporteExcel(comunidadId, tipoReporte) {
  const workbook = new ExcelJS.Workbook();
  
  // Hoja 1: Resumen Ejecutivo
  const sheet1 = workbook.addWorksheet('Resumen Ejecutivo');
  const dashboardData = await query(
    'SELECT * FROM vw_dashboard_financiero WHERE comunidad_id = ?',
    [comunidadId]
  );
  sheet1.addRows(dashboardData);
  
  // Hoja 2: Detalle de Ingresos
  const sheet2 = workbook.addWorksheet('Ingresos');
  const ingresosData = await query(
    'SELECT ... FROM pago WHERE comunidad_id = ?',
    [comunidadId]
  );
  sheet2.addRows(ingresosData);
  
  // Hoja 3: Detalle de Gastos
  const sheet3 = workbook.addWorksheet('Gastos');
  // ...
  
  // Hoja 4: Morosidad
  const sheet4 = workbook.addWorksheet('Morosidad');
  // ...
  
  // Aplicar formato
  sheet1.getRow(1).font = { bold: true };
  sheet1.columns.forEach(column => {
    column.width = 20;
  });
  
  // Guardar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
```

---

## 🎯 MÉTRICAS CLAVE (SUMMARY)

```
┌─────────────────────────────────────────────────────────┐
│  KPIs ESENCIALES PARA GESTIÓN DE COMUNIDADES           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FINANCIEROS                                            │
│  ├─ Tasa de Morosidad < 15%                  🎯 CRÍTICO│
│  ├─ Tasa de Recaudación > 85%                🎯 CRÍTICO│
│  ├─ Días de Reserva (saldo/gasto diario) > 90  ⚠️ IMPORTANTE│
│  └─ Costo por unidad mensual                  ℹ️ INFO  │
│                                                         │
│  OPERACIONALES                                          │
│  ├─ SLA Tickets < 24h (80% cumplimiento)     🎯 CRÍTICO│
│  ├─ Satisfacción residentes > 4.0/5.0        ⚠️ IMPORTANTE│
│  ├─ Uso amenidades > 60%                      ℹ️ INFO  │
│  └─ Mantenciones preventivas cumplidas > 95% ⚠️ IMPORTANTE│
│                                                         │
│  ADMINISTRATIVOS                                        │
│  ├─ Documentos al día (actas, balances)      🎯 CRÍTICO│
│  ├─ Presupuesto ejecutado 90-110%            ⚠️ IMPORTANTE│
│  └─ Rotación de proveedores < 30%            ℹ️ INFO  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```markdown
### FASE 1: Reportes Básicos
- [ ] Dashboard financiero principal
- [ ] Reporte de morosidad
- [ ] Estado de resultados mensual
- [ ] Certificados de deuda/al día

### FASE 2: Analytics Avanzados
- [ ] Proyecciones financieras
- [ ] Análisis de tendencias
- [ ] Comparativos período a período
- [ ] Aging de cuentas por cobrar

### FASE 3: Visualizaciones
- [ ] Gráficos interactivos
- [ ] Dashboards por rol
- [ ] Alertas automáticas
- [ ] KPIs en tiempo real

### FASE 4: Automatización
- [ ] Reportes programados
- [ ] Exportación automática
- [ ] Envío por email
- [ ] Integración con BI tools

### FASE 5: Cumplimiento Legal
- [ ] Certificados oficiales
- [ ] Documentos tributarios
- [ ] Respaldos para auditorías
- [ ] Trazabilidad completa
```

---

**Fecha:** Octubre 2025  
**Versión:** 1.0  
**Módulo:** 6 de 6

