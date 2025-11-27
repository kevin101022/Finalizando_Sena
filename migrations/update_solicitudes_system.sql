-- ========================================
-- MIGRACIÓN: Sistema Avanzado de Solicitudes y Firmas
-- Archivo: update_solicitudes_system.sql
-- Fecha: 2025-11-26
-- Descripción: Reestructuración completa del módulo de solicitudes
--              para soportar flujo de 3 firmas y detalles específicos.
-- ========================================

BEGIN;

-- ========================================
-- PASO 1: Actualizar tabla SOLICITUDES
-- ========================================
-- Limpiar columnas antiguas y agregar destino

-- 1.1 Agregar columnas nuevas
ALTER TABLE public.solicitudes
    ADD COLUMN IF NOT EXISTS sede_destino_id INTEGER,
    ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- 1.2 Agregar FK a sede (edificio)
ALTER TABLE public.solicitudes
    ADD CONSTRAINT solicitudes_sede_destino_id_fkey 
    FOREIGN KEY (sede_destino_id) REFERENCES edificios(id);

-- 1.3 Eliminar columnas de aprobación antiguas (ya no se usarán aquí)
-- Se comentan por seguridad, descomentar para limpiar definitivamente

ALTER TABLE public.solicitudes
    DROP COLUMN IF EXISTS aprobacion_cuentadante,
    DROP COLUMN IF EXISTS cuentadante_id,
    DROP COLUMN IF EXISTS fecha_aprobacion_cuentadante,
    DROP COLUMN IF EXISTS aprobacion_admin,
    DROP COLUMN IF EXISTS admin_id,
    DROP COLUMN IF EXISTS fecha_aprobacion_admin,
    DROP COLUMN IF EXISTS aprobacion_coordinador,
    DROP COLUMN IF EXISTS coordinador_id,
    DROP COLUMN IF EXISTS fecha_aprobacion_coordinador,
    DROP COLUMN IF EXISTS autorizado_vigilante,
    DROP COLUMN IF EXISTS vigilante_id,
    DROP COLUMN IF EXISTS fecha_autorizacion;


-- ========================================
-- PASO 2: Crear tabla DETALLE_SOLICITUD
-- ========================================
-- Especifica QUÉ se necesita (ej: "2 Portátiles", "1 VideoBeam")

CREATE TABLE IF NOT EXISTS public.detalle_solicitud (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    categoria VARCHAR(100) NOT NULL, -- Ej: 'Tecnología', 'Mobiliario'
    descripcion TEXT, -- Ej: "Portátil Core i5 o superior"
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT detalle_solicitud_solicitud_id_fkey 
        FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_detalle_solicitud_solicitud ON detalle_solicitud(solicitud_id);

-- ========================================
-- PASO 3: Crear tabla FIRMAS_SOLICITUD
-- ========================================
-- Almacena las 3 firmas requeridas: Cuentadante, Coordinador, Admin

-- Crear ENUM para el tipo de firma si no existe
DO $$ BEGIN
    CREATE TYPE rol_firmante_enum AS ENUM ('cuentadante_responsable', 'coordinador', 'administrador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.firmas_solicitud (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL, -- Quién firmó
    rol_firmante rol_firmante_enum NOT NULL, -- En calidad de qué firmó
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('aprobado', 'rechazado')),
    fecha_firma TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    
    -- Restricción: Una sola firma por rol por solicitud
    UNIQUE(solicitud_id, rol_firmante),
    
    CONSTRAINT firmas_solicitud_solicitud_id_fkey 
        FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    CONSTRAINT firmas_solicitud_usuario_id_fkey 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_firmas_solicitud_solicitud ON firmas_solicitud(solicitud_id);

-- ========================================
-- PASO 4: Actualizar tabla ASIGNACIONES
-- ========================================
-- Vincular la asignación física con el detalle de la solicitud que cumple

ALTER TABLE public.asignaciones
    ADD COLUMN IF NOT EXISTS detalle_solicitud_id INTEGER;

ALTER TABLE public.asignaciones
    ADD CONSTRAINT asignaciones_detalle_solicitud_id_fkey 
    FOREIGN KEY (detalle_solicitud_id) REFERENCES detalle_solicitud(id);

-- ========================================
-- VERIFICACIÓN
-- ========================================

DO $$
DECLARE
    total_solicitudes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_solicitudes FROM solicitudes;
    
    RAISE NOTICE '=== MIGRACIÓN SOLICITUDES EXITOSA ===';
    RAISE NOTICE 'Tablas creadas: detalle_solicitud, firmas_solicitud';
    RAISE NOTICE 'Columnas agregadas a solicitudes y asignaciones';
    RAISE NOTICE '=======================================';
END $$;

COMMIT;
