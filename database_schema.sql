-- Base de Datos: Sistema de Gestión de Bienes SENA
-- Motor: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS sena_bienes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sena_bienes;

-- Tabla: Centros de Formación
CREATE TABLE centros_formacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla: Edificios
CREATE TABLE edificios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    centro_formacion_id INT NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (centro_formacion_id) REFERENCES centros_formacion(id)
);

-- Tabla: Usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('usuario', 'cuentadante', 'administrador', 'coordinador', 'vigilante', 'almacenista') NOT NULL,
    centro_formacion_id INT,
    edificio_id INT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (centro_formacion_id) REFERENCES centros_formacion(id),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id)
);

-- Tabla: Bienes
CREATE TABLE bienes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    valor_compra DECIMAL(15, 2),
    fecha_compra DATE,
    estado ENUM('disponible', 'en_prestamo', 'en_mantenimiento', 'dado_de_baja') DEFAULT 'disponible',
    cuentadante_id INT,
    edificio_id INT NOT NULL,
    centro_formacion_id INT NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cuentadante_id) REFERENCES usuarios(id),
    FOREIGN KEY (edificio_id) REFERENCES edificios(id),
    FOREIGN KEY (centro_formacion_id) REFERENCES centros_formacion(id)
);

-- Tabla: Solicitudes de Préstamo
CREATE TABLE solicitudes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_prestamo DATE NOT NULL,
    fecha_fin_prestamo DATE NOT NULL,
    motivo TEXT NOT NULL,
    
    -- Estado general
    estado ENUM('pendiente', 'aprobada', 'rechazada', 'autorizada', 'en_prestamo', 'devuelta') DEFAULT 'pendiente',
    
    -- Aprobaciones (3 firmas requeridas)
    aprobacion_cuentadante BOOLEAN DEFAULT FALSE,
    cuentadante_id INT,
    fecha_aprobacion_cuentadante TIMESTAMP NULL,
    
    aprobacion_admin BOOLEAN DEFAULT FALSE,
    admin_id INT,
    fecha_aprobacion_admin TIMESTAMP NULL,
    
    aprobacion_coordinador BOOLEAN DEFAULT FALSE,
    coordinador_id INT,
    fecha_aprobacion_coordinador TIMESTAMP NULL,
    
    -- Autorización vigilante (solo si tiene 3/3 firmas)
    autorizado_vigilante BOOLEAN DEFAULT FALSE,
    vigilante_id INT,
    fecha_autorizacion TIMESTAMP NULL,
    
    -- Devolución
    fecha_devolucion TIMESTAMP NULL,
    vigilante_devolucion_id INT,
    
    -- Rechazo
    motivo_rechazo TEXT,
    rechazado_por INT,
    fecha_rechazo TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (cuentadante_id) REFERENCES usuarios(id),
    FOREIGN KEY (admin_id) REFERENCES usuarios(id),
    FOREIGN KEY (coordinador_id) REFERENCES usuarios(id),
    FOREIGN KEY (vigilante_id) REFERENCES usuarios(id),
    FOREIGN KEY (vigilante_devolucion_id) REFERENCES usuarios(id),
    FOREIGN KEY (rechazado_por) REFERENCES usuarios(id)
);

-- Tabla: Bienes en Solicitud (relación muchos a muchos)
CREATE TABLE solicitud_bienes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    bien_id INT NOT NULL,
    cantidad INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (bien_id) REFERENCES bienes(id),
    UNIQUE KEY unique_solicitud_bien (solicitud_id, bien_id)
);

-- Tabla: Historial de Movimientos
CREATE TABLE historial_movimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bien_id INT NOT NULL,
    solicitud_id INT,
    tipo_movimiento ENUM('asignacion', 'prestamo', 'devolucion', 'mantenimiento', 'baja') NOT NULL,
    usuario_responsable_id INT NOT NULL,
    descripcion TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bien_id) REFERENCES bienes(id),
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id),
    FOREIGN KEY (usuario_responsable_id) REFERENCES usuarios(id)
);

-- Tabla: Reportes Generados
CREATE TABLE reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_reporte VARCHAR(100) NOT NULL,
    generado_por INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    parametros JSON,
    archivo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_bienes_estado ON bienes(estado);
CREATE INDEX idx_bienes_cuentadante ON bienes(cuentadante_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_usuario ON solicitudes(usuario_id);
CREATE INDEX idx_solicitudes_fechas ON solicitudes(fecha_inicio_prestamo, fecha_fin_prestamo);

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
