-- Migration: Agregar tablas de Ambientes y Asignaciones
-- Fecha: 2025-11-25
-- Descripción: Añade las tablas necesarias para gestionar ambientes (salones) y 
--              el historial de asignaciones de bienes a cuentadantes

-- ============================================
-- Tabla: ambientes (Salones/Aulas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ambientes
(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    edificio_id INTEGER NOT NULL,
    centro_formacion_id INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT ambientes_edificio_id_fkey FOREIGN KEY (edificio_id)
        REFERENCES public.edificios (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    
    CONSTRAINT ambientes_centro_formacion_id_fkey FOREIGN KEY (centro_formacion_id)
        REFERENCES public.centros_formacion (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Índices para mejorar rendimiento en búsquedas
CREATE INDEX IF NOT EXISTS idx_ambientes_edificio ON public.ambientes(edificio_id);
CREATE INDEX IF NOT EXISTS idx_ambientes_centro ON public.ambientes(centro_formacion_id);
CREATE INDEX IF NOT EXISTS idx_ambientes_activo ON public.ambientes(activo);

-- ============================================
-- Tabla: asignaciones (Historial de asignaciones)
-- ============================================
CREATE TABLE IF NOT EXISTS public.asignaciones
(
    id SERIAL PRIMARY KEY,
    bien_id INTEGER NOT NULL,
    cuentadante_id INTEGER NOT NULL,
    ambiente_id INTEGER NOT NULL,
    fecha_asignacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP WITHOUT TIME ZONE NULL,
    activa BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    asignado_por INTEGER NOT NULL, -- Usuario (almacenista) que realizó la asignación
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT asignaciones_bien_id_fkey FOREIGN KEY (bien_id)
        REFERENCES public.bienes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    
    CONSTRAINT asignaciones_cuentadante_id_fkey FOREIGN KEY (cuentadante_id)
        REFERENCES public.usuarios (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    
    CONSTRAINT asignaciones_ambiente_id_fkey FOREIGN KEY (ambiente_id)
        REFERENCES public.ambientes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    
    CONSTRAINT asignaciones_asignado_por_fkey FOREIGN KEY (asignado_por)
        REFERENCES public.usuarios (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_asignaciones_bien ON public.asignaciones(bien_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_cuentadante ON public.asignaciones(cuentadante_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_ambiente ON public.asignaciones(ambiente_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_activa ON public.asignaciones(activa);
CREATE INDEX IF NOT EXISTS idx_asignaciones_fecha ON public.asignaciones(fecha_asignacion);

-- ============================================
-- Agregar columna ambiente_id a la tabla bienes (opcional)
-- Para saber rápidamente dónde está un bien
-- ============================================
-- Descomenta si quieres agregar esta columna:
ALTER TABLE public.bienes ADD COLUMN IF NOT EXISTS ambiente_id INTEGER;
ALTER TABLE public.bienes ADD CONSTRAINT bienes_ambiente_id_fkey 
    FOREIGN KEY (ambiente_id) REFERENCES public.ambientes(id);

-- ============================================
-- Datos de ejemplo para testing
-- ============================================

-- Ambientes de ejemplo
INSERT INTO public.ambientes (nombre, codigo, edificio_id, centro_formacion_id) 
VALUES
    ('Aula 101', 'A101', 1, 1),
    ('Laboratorio de Sistemas', 'LAB-SIS-01', 1, 1),
    ('Taller de Electrónica', 'TALL-ELEC-01', 1, 1),
    ('Oficina Administrativa', 'OF-ADM-01', 2, 2),
    ('Bodega General', 'BOD-GEN-01', 1, 1)
ON CONFLICT (codigo) DO NOTHING;

-- Comentario: Las asignaciones se crearán desde la aplicación web
-- cuando el almacenista asigne bienes a cuentadantes

-- ============================================
-- Verificación de la migración
-- ============================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- SELECT * FROM ambientes;
-- SELECT * FROM asignaciones;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('ambientes', 'asignaciones');
