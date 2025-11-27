-- Agregar columna responsable_id a detalle_solicitud
-- Esto permite saber qué Cuentadante debe firmar por este ítem específico

ALTER TABLE public.detalle_solicitud
    ADD COLUMN IF NOT EXISTS responsable_id INTEGER;

ALTER TABLE public.detalle_solicitud
    ADD CONSTRAINT detalle_solicitud_responsable_id_fkey 
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id);
