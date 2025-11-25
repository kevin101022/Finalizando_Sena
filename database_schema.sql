-- Base de Datos: Sistema de Gestión de Bienes SENA
-- Motor: PostgreSQL

CREATE TABLE IF NOT EXISTS public.bienes
(
    id serial NOT NULL,
    codigo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    nombre character varying(200) COLLATE pg_catalog."default" NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    categoria character varying(100) COLLATE pg_catalog."default",
    marca character varying(100) COLLATE pg_catalog."default",
    modelo character varying(100) COLLATE pg_catalog."default",
    serial character varying(100) COLLATE pg_catalog."default",
    valor_compra numeric(15, 2),
    fecha_compra date,
    estado estado_bien_enum DEFAULT 'disponible'::estado_bien_enum,
    cuentadante_id integer,
    edificio_id integer NOT NULL,
    centro_formacion_id integer NOT NULL,
    observaciones text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bienes_pkey PRIMARY KEY (id),
    CONSTRAINT bienes_codigo_key UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS public.centros_formacion
(
    id serial NOT NULL,
    nombre character varying(200) COLLATE pg_catalog."default" NOT NULL,
    codigo character varying(50) COLLATE pg_catalog."default" NOT NULL,
    direccion text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT centros_formacion_pkey PRIMARY KEY (id),
    CONSTRAINT centros_formacion_codigo_key UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS public.edificios
(
    id serial NOT NULL,
    nombre character varying(200) COLLATE pg_catalog."default" NOT NULL,
    codigo character varying(50) COLLATE pg_catalog."default" NOT NULL,
    centro_formacion_id integer NOT NULL,
    direccion text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT edificios_pkey PRIMARY KEY (id),
    CONSTRAINT edificios_codigo_key UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS public.historial_movimientos
(
    id serial NOT NULL,
    bien_id integer NOT NULL,
    solicitud_id integer,
    tipo_movimiento tipo_movimiento_enum NOT NULL,
    usuario_responsable_id integer NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    fecha_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT historial_movimientos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.reportes
(
    id serial NOT NULL,
    tipo_reporte character varying(100) COLLATE pg_catalog."default" NOT NULL,
    generado_por integer NOT NULL,
    fecha_inicio date,
    fecha_fin date,
    parametros jsonb,
    archivo_url character varying(500) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reportes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.solicitud_bienes
(
    id serial NOT NULL,
    solicitud_id integer NOT NULL,
    bien_id integer NOT NULL,
    cantidad integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT solicitud_bienes_pkey PRIMARY KEY (id),
    CONSTRAINT unique_solicitud_bien UNIQUE (solicitud_id, bien_id)
);

CREATE TABLE IF NOT EXISTS public.solicitudes
(
    id serial NOT NULL,
    usuario_id integer NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_prestamo date NOT NULL,
    fecha_fin_prestamo date NOT NULL,
    motivo text COLLATE pg_catalog."default" NOT NULL,
    estado estado_solicitud_enum DEFAULT 'pendiente'::estado_solicitud_enum,
    aprobacion_cuentadante boolean DEFAULT false,
    cuentadante_id integer,
    fecha_aprobacion_cuentadante timestamp without time zone,
    aprobacion_admin boolean DEFAULT false,
    admin_id integer,
    fecha_aprobacion_admin timestamp without time zone,
    aprobacion_coordinador boolean DEFAULT false,
    coordinador_id integer,
    fecha_aprobacion_coordinador timestamp without time zone,
    autorizado_vigilante boolean DEFAULT false,
    vigilante_id integer,
    fecha_autorizacion timestamp without time zone,
    fecha_devolucion timestamp without time zone,
    vigilante_devolucion_id integer,
    motivo_rechazo text COLLATE pg_catalog."default",
    rechazado_por integer,
    fecha_rechazo timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT solicitudes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id serial NOT NULL,
    nombre character varying(200) COLLATE pg_catalog."default" NOT NULL,
    email character varying(200) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rol rol_enum NOT NULL,
    centro_formacion_id integer,
    edificio_id integer,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
);

ALTER TABLE IF EXISTS public.bienes
    ADD CONSTRAINT bienes_centro_formacion_id_fkey FOREIGN KEY (centro_formacion_id)
    REFERENCES public.centros_formacion (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.bienes
    ADD CONSTRAINT bienes_cuentadante_id_fkey FOREIGN KEY (cuentadante_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_bienes_cuentadante
    ON public.bienes(cuentadante_id);


ALTER TABLE IF EXISTS public.bienes
    ADD CONSTRAINT bienes_edificio_id_fkey FOREIGN KEY (edificio_id)
    REFERENCES public.edificios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.edificios
    ADD CONSTRAINT edificios_centro_formacion_id_fkey FOREIGN KEY (centro_formacion_id)
    REFERENCES public.centros_formacion (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.historial_movimientos
    ADD CONSTRAINT historial_movimientos_bien_id_fkey FOREIGN KEY (bien_id)
    REFERENCES public.bienes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.historial_movimientos
    ADD CONSTRAINT historial_movimientos_solicitud_id_fkey FOREIGN KEY (solicitud_id)
    REFERENCES public.solicitudes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.historial_movimientos
    ADD CONSTRAINT historial_movimientos_usuario_responsable_id_fkey FOREIGN KEY (usuario_responsable_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.reportes
    ADD CONSTRAINT reportes_generado_por_fkey FOREIGN KEY (generado_por)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitud_bienes
    ADD CONSTRAINT solicitud_bienes_bien_id_fkey FOREIGN KEY (bien_id)
    REFERENCES public.bienes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitud_bienes
    ADD CONSTRAINT solicitud_bienes_solicitud_id_fkey FOREIGN KEY (solicitud_id)
    REFERENCES public.solicitudes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_admin_id_fkey FOREIGN KEY (admin_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_coordinador_id_fkey FOREIGN KEY (coordinador_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_cuentadante_id_fkey FOREIGN KEY (cuentadante_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_rechazado_por_fkey FOREIGN KEY (rechazado_por)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario
    ON public.solicitudes(usuario_id);


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_vigilante_devolucion_id_fkey FOREIGN KEY (vigilante_devolucion_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.solicitudes
    ADD CONSTRAINT solicitudes_vigilante_id_fkey FOREIGN KEY (vigilante_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.usuarios
    ADD CONSTRAINT usuarios_centro_formacion_id_fkey FOREIGN KEY (centro_formacion_id)
    REFERENCES public.centros_formacion (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.usuarios
    ADD CONSTRAINT usuarios_edificio_id_fkey FOREIGN KEY (edificio_id)
    REFERENCES public.edificios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;

-- Datos de ejemplo para testing

-- Centros de Formación
INSERT INTO centros_formacion (nombre, codigo) VALUES
('Centro de Tecnología', 'CT001'),
('Centro de Gestión Administrativa', 'CGA001');

-- Edificios
INSERT INTO edificios (nombre, codigo, centro_formacion_id) VALUES
('Edificio Principal', 'EP001', 1),
('Edificio Administrativo', 'EA001', 2);

-- Usuarios (password: todos usan 'password123' hasheado)
-- Nota: En producción, usa bcrypt para hashear las contraseñas
INSERT INTO usuarios (nombre, email, password, rol, centro_formacion_id, edificio_id) VALUES
('Admin Principal', 'admin@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'administrador', 1, 1),
('Juan Pérez', 'cuentadante@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'cuentadante', 1, 1),
('María García', 'almacenista@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'almacenista', 1, 1),
('Carlos López', 'vigilante@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'vigilante', 1, 1),
('Ana Martínez', 'usuario@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'usuario', 1, 1),
('Luis Rodríguez', 'coordinador@sena.edu.co', '$2b$10$rKvvJQxQxQxQxQxQxQxQxO', 'coordinador', 1, 1);

-- Bienes de ejemplo
INSERT INTO bienes (codigo, nombre, descripcion, categoria, valor_compra, estado, edificio_id, centro_formacion_id, cuentadante_id) VALUES
('LAP001', 'Laptop Dell Latitude', 'Laptop para desarrollo', 'Tecnología', 2500000, 'disponible', 1, 1, 2),
('PRO001', 'Proyector Epson', 'Proyector para aulas', 'Audiovisual', 1800000, 'disponible', 1, 1, 2),
('MIC001', 'Microscopio Digital', 'Microscopio para laboratorio', 'Laboratorio', 3500000, 'disponible', 1, 1, 2);
