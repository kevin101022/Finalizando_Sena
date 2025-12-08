# ✅ Checklist de Despliegue

Lista de verificación antes de desplegar a producción.

## 📋 Pre-Despliegue

### Código
- [ ] Todos los `console.log` de debug han sido removidos o comentados
- [ ] No hay `debugger` statements en el código
- [ ] El código pasa el linter: `npm run lint`
- [ ] No hay errores de TypeScript/JavaScript
- [ ] Las dependencias están actualizadas y sin vulnerabilidades: `npm audit`

### Base de Datos
- [ ] El esquema de base de datos está actualizado (`database_schema.sql`)
- [ ] Las migraciones están documentadas
- [ ] Hay backup de la base de datos de producción
- [ ] Las credenciales de producción están configuradas

### Variables de Entorno
- [ ] Todas las variables necesarias están en `.env.example`
- [ ] Las variables de producción están configuradas en el servidor
- [ ] `JWT_SECRET` es diferente al de desarrollo
- [ ] `NODE_ENV=production` está configurado
- [ ] Las credenciales de base de datos son correctas

### Seguridad
- [ ] Las contraseñas están hasheadas con bcrypt
- [ ] Los tokens JWT tienen expiración adecuada
- [ ] Las rutas de API tienen autenticación
- [ ] Los roles y permisos están validados
- [ ] No hay credenciales hardcodeadas en el código
- [ ] El archivo `.env.local` NO está en Git

### Performance
- [ ] Las imágenes están optimizadas
- [ ] Las consultas SQL están optimizadas
- [ ] Hay índices en las tablas necesarias
- [ ] El build de producción funciona: `npm run build`

### Testing
- [ ] Las funcionalidades principales están probadas
- [ ] El login funciona con todos los roles
- [ ] El sistema de 4 firmas funciona correctamente
- [ ] Los filtros y búsquedas funcionan
- [ ] Los modales se abren y cierran correctamente

## 🚀 Despliegue

### Build
```bash
# Instalar dependencias
npm ci

# Build de producción
npm run build

# Verificar que el build fue exitoso
npm start
```

### Base de Datos
```bash
# Backup de producción
pg_dump -U usuario -d sena_bienes > backup_$(date +%Y%m%d).sql

# Aplicar migraciones si es necesario
psql -U usuario -d sena_bienes -f database_schema.sql
```

### Servidor
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado y corriendo
- [ ] Puerto 3000 (o el configurado) está disponible
- [ ] Firewall configurado correctamente
- [ ] SSL/HTTPS configurado (recomendado)

## 📊 Post-Despliegue

### Verificación
- [ ] La aplicación está accesible en la URL de producción
- [ ] El login funciona correctamente
- [ ] Todos los roles pueden acceder a sus dashboards
- [ ] Las solicitudes se pueden crear y firmar
- [ ] Los filtros y búsquedas funcionan
- [ ] Los modales se muestran correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del servidor

### Monitoreo
- [ ] Configurar logs de aplicación
- [ ] Configurar alertas de errores
- [ ] Monitorear uso de recursos (CPU, RAM, Disco)
- [ ] Monitorear conexiones a base de datos
- [ ] Configurar backups automáticos

### Documentación
- [ ] Actualizar documentación de producción
- [ ] Documentar proceso de despliegue
- [ ] Documentar procedimientos de backup/restore
- [ ] Compartir credenciales con el equipo (de forma segura)

## 🔄 Rollback

En caso de problemas:

```bash
# 1. Detener la aplicación
pm2 stop sgb-sena

# 2. Restaurar código anterior
git checkout <commit-anterior>
npm ci
npm run build

# 3. Restaurar base de datos si es necesario
psql -U usuario -d sena_bienes < backup_YYYYMMDD.sql

# 4. Reiniciar aplicación
pm2 start sgb-sena
```

## 📞 Contactos de Emergencia

- **Desarrollador Principal**: [Nombre] - [Email/Teléfono]
- **Administrador de Base de Datos**: [Nombre] - [Email/Teléfono]
- **Administrador de Sistemas**: [Nombre] - [Email/Teléfono]

---

**Última actualización**: Diciembre 2024
