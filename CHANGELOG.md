# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.0.0] - 2024-12-08

### ✨ Características Principales

#### Sistema de Gestión
- Sistema completo de gestión de bienes institucionales
- Sistema de 4 firmas para control de préstamos
- 6 roles de usuario con permisos específicos
- Dashboard personalizado por rol

#### Autenticación y Seguridad
- Sistema de autenticación con JWT
- Encriptación de contraseñas con bcryptjs
- Middleware de protección de rutas
- Validación de roles y permisos

#### Gestión de Inventario
- Registro completo de bienes con información detallada
- Asignación de bienes a cuentadantes
- Control de estados de bienes
- Historial de asignaciones

#### Sistema de Solicitudes
- Creación de solicitudes de préstamo
- Sistema de 4 firmas:
  1. Cuentadante (aprobación inicial)
  2. Coordinador (aprobación definitiva)
  3. Vigilante (autorización de salida)
  4. Vigilante (registro de entrada)
- Seguimiento de estado de solicitudes
- Historial completo de solicitudes

#### Interfaz de Usuario
- Diseño moderno y responsive con TailwindCSS v4
- Tablas elegantes con iconos y hover effects
- Modales con scroll independiente
- Filtros avanzados en todas las tablas
- Buscador por múltiples campos
- Selector de estados
- Notificaciones Toast elegantes
- Diálogos de confirmación personalizados

#### Componentes Reutilizables
- `TablaSolicitudes` - Tabla de solicitudes con filtros
- `ModalDetalleSolicitud` - Modal de detalles de solicitudes
- `Toast` - Sistema de notificaciones
- `ConfirmDialog` - Diálogos de confirmación
- `Sidebar` - Navegación lateral por rol
- `RoleSwitcher` - Selector de roles para usuarios multi-rol

### 🎨 Diseño

#### Paleta de Colores
- Verde Principal: #39A900 (Color institucional SENA)
- Verde Secundario: #007832
- Gradientes y efectos visuales consistentes

#### Mejoras Visuales
- Iconos SVG en todas las secciones
- Gradientes sutiles en fondos
- Sombras y bordes redondeados
- Animaciones suaves (fadeIn, scale-in, slide-in)
- Estados vacíos con iconos grandes
- Loading states mejorados

### 🔧 Optimizaciones

#### Código
- Eliminación de dependencias duplicadas (bcrypt)
- Limpieza de carpetas vacías (migrations, public)
- Función helper reutilizable para filtrado de solicitudes
- Componentes optimizados y reutilizables

#### Base de Datos
- Consultas SQL optimizadas
- Subconsultas para obtener datos relacionados
- Índices en campos frecuentemente consultados

#### Performance
- Lazy loading de componentes
- Optimización de re-renders
- Paginación en tablas grandes

### 📚 Documentación

#### Archivos Creados
- `README.md` - Documentación completa del proyecto
- `CONTRIBUTING.md` - Guía de contribución
- `CHANGELOG.md` - Registro de cambios
- `CHECKLIST_DEPLOYMENT.md` - Lista de verificación para despliegue
- `LICENSE` - Licencia MIT
- `.env.example` - Plantilla de variables de entorno

#### Documentación Existente
- `FLUJO_SISTEMA.md` - Flujo del sistema de solicitudes
- `database_schema.sql` - Esquema de base de datos
- `ENV_TEMPLATE.txt` - Template de variables de entorno

### 🐛 Correcciones

#### Filtros y Búsqueda
- Corregido estado "devuelto" en selector de estados
- Agregado campo `cuentadante_nombre` en API de solicitudes
- Búsqueda mejorada por ID, cuentadante, destino, solicitante y motivo

#### Rutas y Navegación
- Consolidación de rutas `/admin/` a `/administrador/`
- Actualización de referencias en Sidebar
- Limpieza de rutas duplicadas

#### Componentes
- Corrección de imports de `ConfirmProvider`
- Eliminación de componente Toast no usado (restaurado después)
- Actualización de todos los modales al nuevo diseño

### 🔄 Migraciones

#### Estructura de Carpetas
- Eliminadas carpetas vacías: `migrations/`, `public/`
- Consolidadas rutas de administrador
- Organización mejorada de componentes

#### Dependencias
- Eliminado `bcrypt` (solo se usa `bcryptjs`)
- Actualizadas dependencias a versiones estables
- Limpieza de package.json

### 📊 Scripts

#### Scripts de Base de Datos
- `setup-db` - Configuración inicial de base de datos
- `reset-db` - Reseteo de base de datos
- `create-users` - Creación de usuarios de prueba
- `create-data` - Creación de datos de prueba

#### Scripts de Desarrollo
- `dev` - Servidor de desarrollo
- `build` - Build de producción
- `start` - Servidor de producción
- `lint` - Linter de código

### 🎯 Roles Implementados

1. **Administrador**
   - Gestión de usuarios y roles
   - Asignación de sedes
   - Monitoreo de solicitudes

2. **Almacenista**
   - Registro de bienes
   - Asignación de bienes a cuentadantes
   - Gestión de inventario
   - Historial de asignaciones

3. **Cuentadante**
   - Gestión de bienes asignados
   - Primera firma en solicitudes
   - Historial de solicitudes

4. **Coordinador**
   - Aprobación definitiva de solicitudes
   - Segunda firma
   - Historial completo

5. **Vigilante**
   - Autorización de salidas (tercera firma)
   - Registro de entradas (cuarta firma)
   - Historial de autorizaciones

6. **Usuario**
   - Solicitud de préstamos
   - Seguimiento de solicitudes
   - Historial personal

### 🔐 Seguridad

- Autenticación JWT en todas las rutas protegidas
- Validación de roles en backend
- Encriptación de contraseñas
- Protección contra inyección SQL
- Variables de entorno para credenciales sensibles

### 🌐 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Diseño responsive (móvil, tablet, desktop)
- Node.js 18+
- PostgreSQL 14+

---

## Formato

Este changelog sigue el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de Cambios

- `✨ Características` - Nuevas funcionalidades
- `🐛 Correcciones` - Corrección de bugs
- `🔧 Optimizaciones` - Mejoras de performance
- `📚 Documentación` - Cambios en documentación
- `🎨 Diseño` - Cambios visuales
- `🔐 Seguridad` - Correcciones de seguridad
- `🔄 Migraciones` - Cambios en estructura
