-- ========================================
-- MIGRACIÓN: Tabla de Marcas
-- Archivo: add_marcas_table.sql
-- Fecha: 2025-11-26
-- Descripción: Normalizar marcas de bienes en tabla separada
-- ========================================

BEGIN;

-- ========================================
-- PASO 1: Crear tabla de marcas
-- ========================================

CREATE TABLE IF NOT EXISTS public.marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_marcas_nombre ON marcas(nombre);
CREATE INDEX IF NOT EXISTS idx_marcas_activo ON marcas(activo);

-- ========================================
-- PASO 2: Migrar marcas existentes desde bienes
-- ========================================
-- Extraer todas las marcas únicas que ya existen

INSERT INTO marcas (nombre, activo)
SELECT DISTINCT 
    TRIM(marca) as nombre,
    true as activo
FROM bienes
WHERE marca IS NOT NULL 
  AND TRIM(marca) != ''
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- PASO 3: Agregar columna marca_id a bienes
-- ========================================

ALTER TABLE public.bienes 
    ADD COLUMN IF NOT EXISTS marca_id INTEGER;

-- ========================================
-- PASO 4: Poblar marca_id con IDs de marcas
-- ========================================
-- Relacionar cada bien con su marca correspondiente

UPDATE bienes b
SET marca_id = m.id
FROM marcas m
WHERE TRIM(b.marca) = m.nombre
  AND b.marca IS NOT NULL
  AND TRIM(b.marca) != '';

-- ========================================
-- PASO 5: Agregar foreign key
-- ========================================

ALTER TABLE public.bienes
    ADD CONSTRAINT bienes_marca_id_fkey 
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL;

-- Índice para mejorar rendimiento en búsquedas por marca
CREATE INDEX IF NOT EXISTS idx_bienes_marca_id ON bienes(marca_id);

-- ========================================
-- PASO 6: Eliminar columna antigua marca (VARCHAR)
-- ========================================
-- Comentado por seguridad - ejecutar solo después de verificar

-- ALTER TABLE public.bienes DROP COLUMN IF EXISTS marca;

-- ========================================
-- PASO 7: Insertar marcas comunes (opcional)
-- ========================================
-- Marcas populares para facilitar registro

INSERT INTO marcas (nombre, activo) VALUES
    -- Tecnología y Audiovisual
    ('HP', true),
    ('Dell', true),
    ('Lenovo', true),
    ('Samsung', true),
    ('LG', true),
    ('Epson', true),
    ('Canon', true),
    ('Toshiba', true),
    ('Asus', true),
    ('Acer', true),
    ('Apple', true),
    ('Microsoft', true),
    ('Sony', true),
    ('Cisco', true),
    ('TP-Link', true),
    -- Mobiliario y Oficina
    ('Rimax', true),
    ('Corona', true),
    ('Steelcase', true),
    ('Herman Miller', true),
    ('IKEA', true),
    ('Haworth', true),
    ('Knoll', true),
    ('HON', true),
    ('Teknion', true),
    ('Humanscale', true)
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- VERIFICACIÓN
-- ========================================

DO $$
DECLARE
    total_marcas INTEGER;
    total_bienes_con_marca INTEGER;
    total_bienes_sin_marca INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_marcas FROM marcas WHERE activo = true;
    SELECT COUNT(*) INTO total_bienes_con_marca FROM bienes WHERE marca_id IS NOT NULL;
    SELECT COUNT(*) INTO total_bienes_sin_marca FROM bienes WHERE marca_id IS NULL;
    
    RAISE NOTICE '=== MIGRACIÓN MARCAS EXITOSA ===';
    RAISE NOTICE 'Marcas activas: %', total_marcas;
    RAISE NOTICE 'Bienes con marca: %', total_bienes_con_marca;
    RAISE NOTICE 'Bienes sin marca: %', total_bienes_sin_marca;
    RAISE NOTICE '==================================';
END $$;

COMMIT;

-- ========================================
-- NOTAS POST-MIGRACIÓN
-- ========================================
-- 
-- 1. La columna "marca" (VARCHAR) aún existe para rollback
-- 2. Para eliminarla definitivamente, ejecuta:
--    ALTER TABLE bienes DROP COLUMN marca;
--
-- 3. Para agregar una marca nueva desde la aplicación:
--    INSERT INTO marcas (nombre) VALUES ('NuevaMarca')
--    ON CONFLICT (nombre) DO NOTHING RETURNING id;
--
-- ========================================
