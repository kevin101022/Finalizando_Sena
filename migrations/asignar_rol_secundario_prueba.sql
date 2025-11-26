-- Script para asignar un rol secundario a un usuario de prueba
-- Esto permite probar el sistema de múltiples roles

-- Asignar rol "coordinador" como secundario al usuario cuentadante (usuario ID 2)
INSERT INTO usuario_roles (usuario_id, rol_id, es_principal)
VALUES (2, 6, false)  -- rol_id 6 = coordinador
ON CONFLICT (usuario_id, rol_id) DO NOTHING;

-- Verificar los roles del usuario
SELECT 
    u.id,
    u.nombre,
    u.email,
    r.nombre as rol,
    ur.es_principal
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.id = 2
ORDER BY ur.es_principal DESC;
