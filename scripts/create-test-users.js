// Script para crear usuarios de prueba en PostgreSQL con contraseñas hasheadas
// Ahora compatible con el sistema de múltiples roles
// 
// CÓMO EJECUTAR:
// 1. Asegúrate de tener las dependencias instaladas (npm install)
// 2. Crea el archivo .env.local con las credenciales de PostgreSQL
// 3. Ejecuta: npm run create-users
//
// Este script creará todos los usuarios de prueba del archivo CREDENCIALES.md
// y les asignará su rol principal en las nuevas tablas roles y usuario_roles

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

// Configuración de la base de datos (mismo que lib/db.js)
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: '123456',
});

const SALT_ROUNDS = 10;

// Usuarios de prueba (según CREDENCIALES.md)
const usuarios = [
    {
        nombre: 'Admin Principal',
        email: 'admin@sena.edu.co',
        password: 'admin123',
        rolNombre: 'administrador'
    },
    {
        nombre: 'Juan Pérez',
        email: 'cuentadante@sena.edu.co',
        password: 'cuenta123',
        rolNombre: 'cuentadante'
    },
    {
        nombre: 'María García',
        email: 'almacenista@sena.edu.co',
        password: 'alma123',
        rolNombre: 'almacenista'
    },
    {
        nombre: 'Carlos López',
        email: 'vigilante@sena.edu.co',
        password: 'vigi123',
        rolNombre: 'vigilante'
    },
    {
        nombre: 'Ana Martínez',
        email: 'usuario@sena.edu.co',
        password: 'user123',
        rolNombre: 'usuario'
    },
    {
        nombre: 'Luis Rodríguez',
        email: 'coordinador@sena.edu.co',
        password: 'coord123',
        rolNombre: 'coordinador'
    }
];

async function createUsers() {
    console.log('🚀 Iniciando creación de usuarios de prueba...\n');

    try {
        for (const user of usuarios) {
            console.log(`Procesando: ${user.email}...`);

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // 1. Obtener el ID del rol desde la tabla roles
            const rolResult = await pool.query(
                'SELECT id FROM roles WHERE nombre = $1',
                [user.rolNombre]
            );

            if (rolResult.rows.length === 0) {
                console.log(`❌ Error: Rol "${user.rolNombre}" no existe en la tabla roles`);
                continue;
            }

            const rolId = rolResult.rows[0].id;

            // 2. Insertar usuario con rol_principal_id
            const insertUserResult = await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol_principal_id) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
                [user.nombre, user.email, hashedPassword, rolId]
            );

            if (insertUserResult.rows.length > 0) {
                const userId = insertUserResult.rows[0].id;
                console.log(`✅ Usuario creado: ${user.email} (ID: ${userId})`);

                // 3. Insertar en usuario_roles (rol principal)
                await pool.query(
                    `INSERT INTO usuario_roles (usuario_id, rol_id, es_principal) 
             VALUES ($1, $2, true)
             ON CONFLICT (usuario_id, rol_id) DO NOTHING`,
                    [userId, rolId]
                );
                
                console.log(`   ✓ Rol principal asignado: ${user.rolNombre}`);
            } else {
                console.log(`⚠️  Usuario ya existe: ${user.email}`);
            }
        }

        console.log('\n🎉 ¡Proceso completado!');
        console.log('\n📋 Usuarios disponibles:');
        usuarios.forEach(u => {
            console.log(`   ${u.email} - ${u.password} (${u.rolNombre})`);
        });

    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
        console.error('Detalles:', error.message);
    } finally {
        // Cerrar el pool
        await pool.end();
    }
}

// Ejecutar el script
createUsers();
