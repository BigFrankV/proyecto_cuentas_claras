# 📘 Cuentas Claras — Carga de Datos

Este archivo describe el orden y las recomendaciones para insertar datos en la base de datos del sistema **Cuentas Claras**, respetando la integridad referencial y evitando errores comunes (como conflictos de claves foráneas o duplicación de claves únicas).

---

## ✅ Orden recomendado de carga de datos (`INSERT`)
> ⚠️ **Importante**: Las *vistas* (`VIEW`) no deben recibir inserts directamente.

### 🔹 1. Tablas base sin dependencias externas
Estas tablas pueden cargarse primero sin depender de otras:
```sql
pais
region
provincia
comuna
moneda
rol
tipo_identificacion
uf_valor
utm_valor
```

---

### 🔹 2. Tablas de personas y usuarios
```sql
persona
usuario
user_preferences
```

---

### 🔹 3. Tablas relacionadas con comunidades y estructuras
```sql
comunidad
edificio_torre
unidad
coeficiente_unidad
tenencia_unidad
membresia_comunidad
```

---

### 🔹 4. Tablas de configuración y categorías
```sql
categoria_gasto
centro_costo
configuracion_interes
parametros_cobranza
```

---

### 🔹 5. Tablas operativas de gastos y emisión
```sql
gasto
emision_gasto_comun
detalle_emision
emision_gasto_detalle
```

---

### 🔹 6. Cargos y cobros
```sql
cargo_unidad
cargo_unidad_detalle
cuenta_cobro_unidad
detalle_cuenta_unidad
multa
```

---

### 🔹 7. Pagos
```sql
pago
pago_aplicacion
webhook_pago
conciliacion_bancaria
```

---

### 🔹 8. Medidores y consumo
```sql
medidor
lectura_medidor
tarifa_consumo
```

---

### 🔹 9. Soporte y gestión interna
```sql
solicitud_soporte
ticket
notificacion
registro_conserjeria
auditoria
```

---

### 🔹 10. Reservas y amenities
```sql
amenidad
reserva_amenidad
```

---

### 🔹 11. Documentos
```sql
documento
```

---

## 🧩 Vistas (solo consulta)
Estas vistas son de solo lectura y **no deben recibir datos mediante INSERT, UPDATE o DELETE**:
```sql
bitacora_conserjeria
Viewcargo_unidad
Viewcargo_unidad_detalle
Viewemision_gasto_comun
Viewemision_gasto_detalle
Viewmembresia_comunidad
Viewtenencia_unidad
Viewticket
```

---

## ✅ Recomendaciones generales

- Cargar los datos por bloques siguiendo el orden indicado.
- Para cargas masivas, se recomienda desactivar temporalmente la validación de claves foráneas:
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- realizar inserts aquí
SET FOREIGN_KEY_CHECKS = 1;
```
- Verificar que los IDs utilizados en relaciones foráneas existan antes de insertar.
- Los datos de prueba deben ser coherentes, especialmente para pruebas funcionales o demostraciones.

---

📅 Generado automáticamente el 2025-10-02 20:59:08
