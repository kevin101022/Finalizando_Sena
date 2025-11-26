-- ========================================
-- MIGRACIÓN: Sistema de Múltiples Roles
-- Archivo: migracion_sistema_roles.sql
-- Fecha: 2025-11-25
-- Descripción: Migrar de rol_enum a tabla de roles con soporte para múltiples roles por usuario
-- ========================================

BEGIN;

-- ========================================
-- PASO 1: Crear tabla de roles
-- ========================================
-- Esta tabla almacena los 6 roles del sistema
-- En lugar de usar ENUM, ahora los roles son registros en una tabla

CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los 6 roles que ya existen en el sistema
INSERT INTO roles (id, nombre, descripcion, activo) VALUES
    (1, 'administrador', 'Acceso total al sistema, gestión de usuarios y configuración', true),
    (2, 'cuentadante', 'Responsable de bienes asignados, genera reportes y auditorías', true),
    (3, 'almacenista', 'Registra, modifica y da de baja bienes del inventario', true),
    (4, 'vigilante', 'Registra entradas y salidas de bienes, autoriza préstamos', true),
    (5, 'usuario', 'Puede solicitar préstamos de bienes', true),
    (6, 'coordinador', 'Aprueba o rechaza solicitudes de su área', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PASO 2: Crear tabla intermedia usuario_roles
-- ========================================
-- Esta tabla permite que un usuario tenga MÚLTIPLES roles
-- Relación: MUCHOS a MUCHOS entre usuarios y roles

CREATE TABLE IF NOT EXISTS public.usuario_roles (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol_id INTEGER NOT NULL,
    es_principal BOOLEAN DEFAULT false, -- Indica cuál es el rol principal del usuario
    asignado_por INTEGER, -- Quién asignó este rol (para auditoría)
    fecha_asignacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, rol_id), -- Un usuario no puede tener el mismo rol duplicado
    CONSTRAINT usuario_roles_usuario_fkey 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT usuario_roles_rol_fkey 
        FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT usuario_roles_asignado_por_fkey 
        FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para hacer las consultas más rápidas
CREATE INDEX IF NOT EXISTS idx_usuario_roles_usuario_id ON usuario_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_roles_rol_id ON usuario_roles(rol_id);

-- ========================================
-- PASO 3: Agregar columna rol_principal_id a usuarios
-- ========================================
-- Esta columna apunta al rol principal del usuario en la tabla roles

ALTER TABLE public.usuarios 
    ADD COLUMN IF NOT EXISTS rol_principal_id INTEGER;

-- ========================================
-- PASO 4: Migrar datos existentes
-- ========================================
-- Convertir los roles que ya existen (ENUM) a la nueva estructura

-- Actualizar rol_principal_id según el rol actual de cada usuario
UPDATE usuarios 
SET rol_principal_id = CASE 
    WHEN rol::text = 'administrador' THEN 1
    WHEN rol::text = 'cuentadante' THEN 2
    WHEN rol::text = 'almacenista' THEN 3
    WHEN rol::text = 'vigilante' THEN 4
    WHEN rol::text = 'usuario' THEN 5
    WHEN rol::text = 'coordinador' THEN 6
END
WHERE rol_principal_id IS NULL;

-- Insertar en usuario_roles el rol principal de cada usuario
INSERT INTO usuario_roles (usuario_id, rol_id, es_principal, fecha_asignacion)
SELECT 
    id as usuario_id,
    rol_principal_id as rol_id,
    true as es_principal,
    created_at as fecha_asignacion
FROM usuarios
WHERE rol_principal_id IS NOT NULL
ON CONFLICT (usuario_id, rol_id) DO NOTHING;

-- ========================================
-- PASO 5: Agregar foreign key y hacer NOT NULL
-- ========================================

ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_rol_principal_fkey 
    FOREIGN KEY (rol_principal_id) REFERENCES roles(id) ON DELETE RESTRICT;

-- Ahora que todos tienen rol_principal_id, hacerlo obligatorio
ALTER TABLE public.usuarios
    ALTER COLUMN rol_principal_id SET NOT NULL;

-- ========================================
-- PASO 6: Eliminar la columna antigua 'rol'
-- ========================================

ALTER TABLE public.usuarios DROP COLUMN IF EXISTS rol;

-- ========================================
-- PASO 7: Eliminar el ENUM rol_enum
-- ========================================

DROP TYPE IF EXISTS rol_enum CASCADE;

-- ========================================
-- VERIFICACIÓN
-- ========================================

DO $$
DECLARE
    total_usuarios INTEGER;
    total_roles INTEGER;
    total_asignaciones INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_usuarios FROM usuarios;
    SELECT COUNT(*) INTO total_roles FROM roles WHERE activo = true;
    SELECT COUNT(*) INTO total_asignaciones FROM usuario_roles;
    
    RAISE NOTICE '=== MIGRACIÓN EXITOSA ===';
    RAISE NOTICE 'Usuarios migrados: %', total_usuarios;
    RAISE NOTICE 'Roles activos: %', total_roles;
    RAISE NOTICE 'Asignaciones creadas: %', total_asignaciones;
    RAISE NOTICE '=========================';
END $$;

COMMIT;

-- ========================================
-- INSTRUCCIONES POST-MIGRACIÓN
-- ========================================
-- 
-- Para asignar un ROL SECUNDARIO a un usuario (ejemplo):
-- 
-- INSERT INTO usuario_roles (usuario_id, rol_id, es_principal)
-- VALUES (2, 6, false);  -- Asignar rol "coordinador" (id=6) al usuario 2 como secundario
-- 
-- Para consultar todos los roles de un usuario:
-- 
-- SELECT r.nombre, ur.es_principal 
-- FROM roles r
-- JOIN usuario_roles ur ON r.id = ur.rol_id
-- WHERE ur.usuario_id = 2
-- ORDER BY ur.es_principal DESC;
-- 
-- ========================================
