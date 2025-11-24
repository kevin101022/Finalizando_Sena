// Script para crear usuarios de prueba en PostgreSQL con contraseñas hasheadas
// 
// CÓMO EJECUTAR:
// 1. Asegúrate de tener las dependencias instaladas (npm install)
// 2. Crea el archivo .env.local con las credenciales de PostgreSQL
// 3. Ejecuta: node scripts/create-test-users.js
//
// Este script creará todos los usuarios de prueba del archivo CREDENCIALES.md

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
        rol: 'administrador'
    },
    {
        nombre: 'Juan Pérez',
        email: 'cuentadante@sena.edu.co',
        password: 'cuenta123',
        rol: 'cuentadante'
    },
    {
        nombre: 'María García',
        email: 'almacenista@sena.edu.co',
        password: 'alma123',
        rol: 'almacenista'
    },
    {
        nombre: 'Carlos López',
        email: 'vigilante@sena.edu.co',
        password: 'vigi123',
        rol: 'vigilante'
    },
    {
        nombre: 'Ana Martínez',
        email: 'usuario@sena.edu.co',
        password: 'user123',
        rol: 'usuario'
    },
    {
        nombre: 'Luis Rodríguez',
        email: 'coordinador@sena.edu.co',
        password: 'coord123',
        rol: 'coordinador'
    }
];

async function createUsers() {
    console.log('🚀 Iniciando creación de usuarios de prueba...\n');

    try {
        for (const user of usuarios) {
            console.log(`Procesando: ${user.email}...`);

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // Insertar en la base de datos
            // ON CONFLICT DO NOTHING evita errores si el usuario ya existe
            const result = await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
                [user.nombre, user.email, hashedPassword, user.rol]
            );

            if (result.rows.length > 0) {
                console.log(`✅ Usuario creado: ${user.email} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`⚠️  Usuario ya existe: ${user.email}`);
            }
        }

        console.log('\n🎉 ¡Proceso completado!');
        console.log('\n📋 Usuarios disponibles:');
        usuarios.forEach(u => {
            console.log(`   ${u.email} - ${u.password} (${u.rol})`);
        });

    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
    } finally {
        // Cerrar el pool
        await pool.end();
    }
}

// Ejecutar el script
createUsers();
