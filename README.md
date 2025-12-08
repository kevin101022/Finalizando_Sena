# 🏢 Sistema de Gestión de Bienes - SENA

Sistema integral para el control y administración de activos institucionales del SENA con sistema de 4 firmas para préstamos de bienes.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## 📋 Descripción

Aplicación web desarrollada con Next.js que permite gestionar el inventario de bienes del SENA, controlar préstamos con sistema de 4 firmas (Cuentadante, Coordinador, Vigilante Salida y Vigilante Entrada), y autorizar salidas/entradas de bienes.

## ✨ Características Principales

- ✅ **Sistema de autenticación** con JWT y bcryptjs
- ✅ **Dashboard personalizado** por rol de usuario
- ✅ **Gestión de inventario** con registro detallado de bienes
- ✅ **Sistema de 4 firmas** para control completo de préstamos
- ✅ **Control de entrada y salida** de bienes institucionales
- ✅ **6 roles de usuario** con permisos específicos
- ✅ **Filtros avanzados** en todas las tablas (búsqueda y estados)
- ✅ **Notificaciones Toast** y diálogos de confirmación elegantes
- ✅ **Diseño responsive** y moderno con TailwindCSS v4

## 🛠️ Tecnologías

### Frontend
- **Next.js 16.0.3** - Framework React con SSR
- **React 19.2.0** - Biblioteca de UI
- **TailwindCSS v4** - Framework CSS utility-first
- **React Select** - Componentes de selección avanzados

### Backend
- **Next.js API Routes** - Endpoints RESTful
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Pasos de Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/NeygerSerrano/sgb-sena.git
cd sgb-sena
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno:**
   - Copia el archivo de plantilla:
   ```bash
   cp ENV_TEMPLATE.txt .env.local
   ```
   - Edita `.env.local` con tus credenciales de PostgreSQL:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sena_bienes
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=tu_clave_secreta_jwt
   ```

4. **Configura la base de datos:**
   
   a. Crea la base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE sena_bienes;
   ```
   
   b. Importa el esquema:
   ```bash
   psql -U postgres -d sena_bienes -f database_schema.sql
   ```
   
   c. (Opcional) Crea usuarios de prueba:
   ```bash
   npm run create-users
   ```

5. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

6. **Abre tu navegador:**
   - Visita [http://localhost:3000](http://localhost:3000)

## 🚀 Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta el linter

# Scripts de base de datos
npm run setup-db     # Configura la base de datos desde cero
npm run reset-db     # Resetea la base de datos
npm run create-users # Crea usuarios de prueba
npm run create-data  # Crea datos de prueba
```

## 👥 Roles del Sistema

| Rol | Permisos | Funciones Principales |
|-----|----------|----------------------|
| **Administrador** | Gestión completa de usuarios | Asigna roles y sedes (no firma solicitudes) |
| **Almacenista** | Gestión de inventario | Registra y asigna bienes a cuentadantes |
| **Cuentadante** | Gestión de bienes asignados | Aprueba/rechaza solicitudes (1ra firma) |
| **Coordinador** | Aprobación de solicitudes | Aprueba solicitudes (2da firma - definitiva) |
| **Vigilante** | Control de entrada/salida | Autoriza salidas (3ra firma) y entradas (4ta firma) |
| **Usuario** | Solicitud de préstamos | Solicita préstamos de bienes (rol por defecto) |

## 🔐 Credenciales de Prueba

**Login:** Usa **documento + contraseña**

| Rol | Documento | Contraseña | Descripción |
|-----|-----------|------------|-------------|
| Administrador | 1000000001 | admin123 | Gestión de usuarios |
| Coordinador | 1000000006 | coord123 | Aprobación final |
| Cuentadante | 1000000002 | cuenta123 | Primera firma |
| Almacenista | 1000000003 | alma123 | Gestión de inventario |
| Vigilante | 1000000004 | vigi123 | Control de salidas |
| Usuario | 1000000005 | user123 | Solicitudes básicas |

> **Nota:** Los nuevos usuarios pueden registrarse en `/register` y obtendrán el rol "usuario" por defecto.

## 📊 Flujo del Sistema

### Sistema de 4 Firmas

1. **Usuario** solicita préstamo de bienes
2. **Cuentadante** aprueba/rechaza (1ra firma)
3. **Coordinador** aprueba definitivamente (2da firma)
4. **Vigilante** autoriza salida (3ra firma)
5. **Vigilante** registra entrada/devolución (4ta firma)

Ver `FLUJO_SISTEMA.md` para más detalles.

## 📁 Estructura del Proyecto

```
sgb-sena/
├── app/
│   ├── api/              # API Routes (backend)
│   ├── components/       # Componentes reutilizables
│   ├── dashboard/        # Páginas por rol
│   └── register/         # Registro de usuarios
├── lib/
│   ├── auth.js          # Utilidades de autenticación
│   ├── db.js            # Conexión a PostgreSQL
│   └── solicitudUtils.js # Utilidades de solicitudes
├── scripts/             # Scripts de base de datos
├── database_schema.sql  # Esquema de la base de datos
├── ENV_TEMPLATE.txt     # Plantilla de variables de entorno
└── README.md
```

## 🎨 Diseño

### Paleta de Colores
- **Verde Principal**: `#39A900` - Color institucional SENA
- **Verde Secundario**: `#007832` - Complementario
- **Fondos**: Blanco con gradientes verdes en login

### Componentes Destacados
- **Tablas elegantes** con iconos y hover effects
- **Modales con scroll** independiente (header y footer fijos)
- **Filtros avanzados** con búsqueda y selector de estados
- **Notificaciones Toast** con animaciones suaves
- **Diálogos de confirmación** personalizados

## 📚 Documentación Adicional

- **`FLUJO_SISTEMA.md`** - Flujo detallado del sistema de solicitudes
- **`database_schema.sql`** - Esquema completo de la base de datos
- **`ENV_TEMPLATE.txt`** - Plantilla de variables de entorno

## 🔧 Configuración de Producción

### Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=tu_host_produccion
DB_PORT=5432
DB_NAME=sena_bienes
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña_segura

# JWT
JWT_SECRET=clave_secreta_muy_segura_y_larga

# Next.js
NODE_ENV=production
```

### Despliegue

1. **Build de producción:**
```bash
npm run build
```

2. **Inicia el servidor:**
```bash
npm start
```

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en `.env.local`
- Asegúrate de que la base de datos `sena_bienes` exista

### Error al iniciar sesión
- Verifica que los usuarios de prueba estén creados: `npm run create-users`
- Revisa que el JWT_SECRET esté configurado

### Problemas con dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto fue desarrollado para el **SENA (Servicio Nacional de Aprendizaje)** de Colombia.

## 👨‍💻 Autor

**Neyger Serrano**

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
