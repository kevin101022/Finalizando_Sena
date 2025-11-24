# Flujo del Sistema de Gestión de Bienes - SENA

## 🔄 Flujo de Solicitud de Préstamo

```
1. USUARIO NORMAL
   ↓ Solicita préstamo de bien(es)
   
2. CUENTADANTE (Firma 1/3)
   ↓ Aprueba/Rechaza
   
3. ADMINISTRADOR DE EDIFICIO (Firma 2/3)
   ↓ Aprueba/Rechaza
   
4. COORDINADOR (Firma 3/3)
   ↓ Aprueba/Rechaza
   
5. VIGILANTE
   ↓ Verifica las 3 firmas
   ↓ Si tiene 3/3 → Autoriza salida
   ↓ Si tiene < 3 → Rechaza automáticamente
   
6. USUARIO retira el bien
```

## 👥 Roles y Responsabilidades Detalladas

### 1. Usuario Normal
**Acciones:**
- ✅ Solicitar préstamo de uno o varios bienes
- ✅ Ver estado de sus solicitudes (pendiente/aprobada/rechazada)
- ✅ Reintentar solicitud de bienes rechazados
- ✅ Ver historial de préstamos

**Reglas:**
- Puede volver a solicitar bienes rechazados sin límite
- Puede solicitar múltiples bienes en una sola solicitud

---

### 2. Cuentadante (Primera Firma)
**Acciones:**
- ✅ Ver solicitudes de préstamo pendientes
- ✅ Aprobar o rechazar solicitudes
- ✅ Ver bienes asignados bajo su cuidado
- ✅ Generar reportes de solicitudes aprobadas/rechazadas

**Reglas:**
- Tiene bienes asignados por el almacenista
- Es responsable del cuidado de esos bienes
- Su aprobación es la primera de tres necesarias

---

### 3. Administrador de Edificio (Segunda Firma)
**Acciones:**
- ✅ Ver bienes que están en su edificio
- ✅ Ver entradas y salidas de bienes del edificio
- ✅ Aprobar o rechazar solicitudes de préstamo
- ✅ Generar reportes de solicitudes y movimientos

**Reglas:**
- Controla los bienes de su edificio específico
- Su aprobación es la segunda de tres necesarias
- Puede ver el historial de movimientos del edificio

---

### 4. Coordinador (Tercera Firma)
**Acciones:**
- ✅ Ver solicitudes de su dependencia (centro de formación)
- ✅ Aprobar o rechazar solicitudes
- ✅ Generar reportes de solicitudes realizadas/aprobadas/rechazadas

**Reglas:**
- Solo ve solicitudes de su centro de formación
- Su aprobación es la tercera y última necesaria
- Puede filtrar por estado de solicitudes

---

### 5. Vigilante (Verificador Final)
**Acciones:**
- ✅ Ver todas las solicitudes
- ✅ Verificar que tengan las 3 aprobaciones (firmas)
- ✅ Autorizar salida del bien SOLO si tiene 3/3 firmas
- ✅ Rechazar automáticamente si tiene menos de 3 firmas
- ✅ Ver historial de salidas autorizadas

**Reglas:**
- **NO puede aprobar**, solo verifica
- Si una solicitud tiene 2/3 o menos → Rechazo automático
- Si una solicitud tiene 3/3 → Puede autorizar salida
- Registra la hora y fecha de salida del bien

---

### 6. Almacenista (Gestión de Inventario)
**Acciones:**
- ✅ Registrar nuevos bienes en el sistema
- ✅ Asignar bienes a cuentadantes
- ✅ Ver inventario completo
- ✅ Gestionar información de bienes

**Reglas:**
- Es el único que puede registrar bienes nuevos
- Asigna bienes a cuentadantes para su cuidado
- No participa en el proceso de aprobación de solicitudes

---

## 📊 Estados de una Solicitud

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Esperando aprobaciones |
| **1/3 Aprobada** | Solo cuentadante aprobó |
| **2/3 Aprobada** | Cuentadante + Admin aprobaron |
| **3/3 Aprobada** | Todas las firmas completas |
| **Rechazada** | Alguno de los 3 rechazó |
| **Autorizada** | Vigilante autorizó salida |
| **En Préstamo** | Bien retirado de la institución |
| **Devuelto** | Bien retornado |

---

## 🗄️ Estructura de Base de Datos Sugerida

### Tablas Principales:

**usuarios**
- id, nombre, email, password, rol, centro_formacion_id, edificio_id

**bienes**
- id, nombre, descripcion, codigo, valor, estado, cuentadante_id, edificio_id

**solicitudes**
- id, usuario_id, fecha_solicitud, estado
- aprobacion_cuentadante (bool), fecha_aprobacion_cuentadante
- aprobacion_admin (bool), fecha_aprobacion_admin
- aprobacion_coordinador (bool), fecha_aprobacion_coordinador
- autorizado_vigilante (bool), fecha_autorizacion
- motivo_rechazo

**solicitud_bienes** (relación muchos a muchos)
- id, solicitud_id, bien_id, cantidad

**centros_formacion**
- id, nombre, coordinador_id

**edificios**
- id, nombre, administrador_id

---

## 🔐 Validaciones Importantes

1. **Usuario no puede aprobar su propia solicitud**
2. **Vigilante solo autoriza con 3/3 firmas**
3. **Si falta 1 firma → Rechazo automático**
4. **Usuario puede reintentar solicitudes rechazadas**
5. **Cuentadante solo ve solicitudes de sus bienes**
6. **Coordinador solo ve solicitudes de su centro**
7. **Admin solo ve solicitudes de su edificio**

---

## 🚀 Próximos Pasos de Desarrollo

1. ✅ Login y Dashboard (Completado)
2. ⏳ Crear base de datos MySQL
3. ⏳ Implementar CRUD de bienes
4. ⏳ Sistema de solicitudes con flujo de aprobación
5. ⏳ Sistema de firmas digitales
6. ⏳ Generación de reportes PDF
7. ⏳ Notificaciones por email
8. ⏳ Historial de movimientos
