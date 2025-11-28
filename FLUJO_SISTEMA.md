# Flujo del Sistema de Gestión de Bienes - SENA

## 🔄 Flujo de Solicitud de Préstamo

```
1. USUARIO
   ↓ Solicita préstamo de bien(es) asignados a cuentadantes
   
2. CUENTADANTE
   ↓ Firma/Rechaza (solo de sus bienes asignados)
   
3. COORDINADOR
   ↓ Aprueba/Rechaza la solicitud completa
   
4. VIGILANTE
   ↓ Verifica aprobaciones
   ↓ Si aprobada → Autoriza salida
   ↓ Si rechazada → No autoriza
   
5. USUARIO retira el bien
```

## 👥 Roles y Responsabilidades

### 1. Usuario
**Acciones:**
- ✅ Solicitar préstamo de bienes
- ✅ Ver estado de sus solicitudes
- ✅ Ver historial de préstamos

**Reglas:**
- Puede solicitar múltiples bienes en una sola solicitud
- Los bienes deben estar asignados a cuentadantes

---

### 2. Cuentadante
**Acciones:**
- ✅ Ver bienes asignados bajo su responsabilidad
- ✅ Firmar solicitudes de préstamo de sus bienes
- ✅ Ver solicitudes pendientes de firma

**Reglas:**
- Tiene bienes asignados por el almacenista
- Solo puede firmar solicitudes de sus propios bienes
- Los bienes asignados NO pueden estar en préstamo (bloqueados)

---

### 3. Coordinador
**Acciones:**
- ✅ Aprobar o rechazar solicitudes completas
- ✅ Ver todas las solicitudes
- ✅ Generar reportes

**Reglas:**
- Aprueba después de que los cuentadantes firmen
- Su aprobación es necesaria para que el vigilante autorice

---

### 4. Vigilante
**Acciones:**
- ✅ Verificar solicitudes aprobadas
- ✅ Autorizar salida de bienes
- ✅ Ver historial de salidas

**Reglas:**
- Solo autoriza si la solicitud está aprobada por coordinador
- Verifica que todos los cuentadantes hayan firmado

---

### 5. Almacenista
**Acciones:**
- ✅ Registrar nuevos bienes (con placa automática SENA-YYYY-NNNN)
- ✅ Asignar bienes a cuentadantes y ambientes
- ✅ Desasignar bienes (solo si NO están en préstamo)
- ✅ Ver inventario completo
- ✅ Ver historial de asignaciones

**Reglas:**
- Las placas se generan automáticamente
- No puede desasignar bienes que están bloqueados (en préstamo)
- Es el único que puede registrar bienes nuevos

---

### 6. Administrador
**Acciones:**
- ✅ Gestionar usuarios y roles
- ✅ Configuración del sistema
- ✅ Acceso completo

**Reglas:**
- Puede tener múltiples roles (administrador, cuentadante, usuario)
- Acceso a todas las funcionalidades

---

## 📊 Estados de una Solicitud

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Esperando firmas de cuentadantes |
| **Firmada** | Cuentadantes firmaron, esperando coordinador |
| **Aprobada** | Coordinador aprobó |
| **Rechazada** | Coordinador o cuentadante rechazó |
| **Autorizada** | Vigilante autorizó salida |
| **En Préstamo** | Bien retirado |
| **Devuelto** | Bien retornado |

---

## 🗄️ Estructura de Base de Datos (PostgreSQL)

### Tablas Principales:

**persona**
- documento (PK), nombres, apellidos, correo, contraseña, direccion, telefono, tipo_doc

**rol**
- id (PK), nombre

**rol_persona**
- rol_id (FK), doc_persona (FK), sede_id (FK)
- Una persona puede tener múltiples roles

**bienes**
- id (PK), placa (SENA-YYYY-NNNN), descripcion, modelo, marca_id, serial, fecha_compra, vida_util, costo

**asignaciones**
- id (PK), bien_id (FK), ambiente_id (FK), doc_persona (FK), bloqueado (bool), fecha_asignacion
- bloqueado = true cuando el bien está en préstamo

**solicitudes**
- id (PK), fecha_ini_prestamo, fecha_fin_prestamo, doc_persona (FK), destino, motivo, estado, observaciones, sede_id

**detalle_solicitud**
- id (PK), solicitud_id (FK), asignacion_id (FK)

**firma_solicitud**
- id (PK), solicitud_id (FK), rol_usuario, doc_persona (FK), firma (bool), observacion, fecha_firmado

**sedes**
- id (PK), nombre

**ambientes**
- id (PK), nombre, sede_id (FK)

**marcas**
- id (PK), nombre, activo

**estado_bien**
- id (PK), bien_id (FK), estado, fecha_registro

---

## 🔐 Validaciones Importantes

1. **No se puede desasignar un bien que está bloqueado (en préstamo)**
2. **Las placas se generan automáticamente con formato SENA-YYYY-NNNN**
3. **Cuentadante solo firma solicitudes de sus bienes asignados**
4. **Vigilante solo autoriza solicitudes aprobadas**
5. **Un bien bloqueado no puede ser asignado a otro cuentadante**

---

## 🎭 Sistema de Roles Múltiples

Algunas personas pueden tener múltiples roles:

- **Administrador** → puede actuar como cuentadante y usuario
- **Coordinador** → puede actuar como cuentadante y usuario
- **Cuentadante** → puede actuar como usuario

El sistema permite cambiar entre roles sin cerrar sesión mediante un selector elegante en el header.

---

## ✅ Funcionalidades Implementadas

1. ✅ Login con correo y contraseña
2. ✅ Sistema de roles múltiples con selector
3. ✅ Registro de bienes con placa automática
4. ✅ Asignación de bienes a cuentadantes
5. ✅ Desasignación de bienes (con validación de bloqueo)
6. ✅ Historial de asignaciones
7. ✅ Inventario completo con filtros
8. ✅ Dashboard con estadísticas dinámicas
9. ✅ Sistema de bloqueo de bienes en préstamo

---

## ⏳ Pendientes

1. ⏳ Completar flujo de solicitudes de préstamo
2. ⏳ Sistema de firmas de cuentadantes
3. ⏳ Aprobación de coordinador
4. ⏳ Autorización de vigilante
5. ⏳ Gestión de devoluciones
6. ⏳ Reportes y estadísticas avanzadas
