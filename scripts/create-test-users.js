// Script para crear usuarios de prueba en PostgreSQL con contraseñas hasheadas
// Compatible con la nueva estructura de base de datos (tabla persona + rol_persona)
// 
// CÓMO EJECUTAR:
// 1. Asegúrate de tener las dependencias instaladas (npm install)
// 2. Crea el archivo .env.local con las credenciales de PostgreSQL
// 3. Ejecuta: npm run create-users
//
// Este script creará todos los usuarios de prueba en la tabla persona
// y les asignará sus roles en la tabla rol_persona

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

// Usuarios de prueba
const usuarios = [
    {
        documento: '1000000001',
        nombres: 'Admin',
        apellidos: 'Principal',
        correo: 'admin@sena.edu.co',
        direccion: 'Calle 1 #1-1',
        telefono: '3001234567',
        tipo_doc: 'CC',
        password: 'admin123',
        rolNombre: 'administrador'
    },
    {
        documento: '1000000002',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'cuentadante@sena.edu.co',
        direccion: 'Calle 2 #2-2',
        telefono: '3001234568',
        tipo_doc: 'CC',
        password: 'cuenta123',
        rolNombre: 'cuentadante'
    },
    {
        documento: '1000000003',
        nombres: 'María',
        apellidos: 'García',
        correo: 'almacenista@sena.edu.co',
        direccion: 'Calle 3 #3-3',
        telefono: '3001234569',
        tipo_doc: 'CC',
        password: 'alma123',
        rolNombre: 'almacenista'
    },
    {
        documento: '1000000004',
        nombres: 'Carlos',
        apellidos: 'López',
        correo: 'vigilante@sena.edu.co',
        direccion: 'Calle 4 #4-4',
        telefono: '3001234570',
        tipo_doc: 'CC',
        password: 'vigi123',
        rolNombre: 'vigilante'
    },
    {
        documento: '1000000005',
        nombres: 'Ana',
        apellidos: 'Martínez',
        correo: 'usuario@sena.edu.co',
        direccion: 'Calle 5 #5-5',
        telefono: '3001234571',
        tipo_doc: 'CC',
        password: 'user123',
        rolNombre: 'usuario'
    },
    {
        documento: '1000000006',
        nombres: 'Luis',
        apellidos: 'Rodríguez',
        correo: 'coordinador@sena.edu.co',
        direccion: 'Calle 6 #6-6',
        telefono: '3001234572',
        tipo_doc: 'CC',
        password: 'coord123',
        rolNombre: 'coordinador'
    }
];

async function createUsers() {
    console.log('🚀 Iniciando creación de usuarios de prueba...\n');

    try {
        // Primero, obtener o crear una sede por defecto
        let sedeId;
        const sedeResult = await pool.query('SELECT id FROM sedes LIMIT 1');
        
        if (sedeResult.rows.length === 0) {
            console.log('📍 Creando sede por defecto...');
            const newSede = await pool.query(
                "INSERT INTO sedes (nombre) VALUES ('Pescadero') RETURNING id"
            );
            sedeId = newSede.rows[0].id;
            console.log(`✅ Sede creada con ID: ${sedeId}\n`);
        } else {
            sedeId = sedeResult.rows[0].id;
            console.log(`📍 Usando sede existente con ID: ${sedeId}\n`);
        }

        for (const user of usuarios) {
            console.log(`Procesando: ${user.correo}...`);

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // 1. Obtener el ID del rol desde la tabla rol
            const rolResult = await pool.query(
                'SELECT id FROM rol WHERE nombre = $1',
                [user.rolNombre]
            );

            if (rolResult.rows.length === 0) {
                console.log(`❌ Error: Rol "${user.rolNombre}" no existe en la tabla rol`);
                continue;
            }

            const rolId = rolResult.rows[0].id;

            // 2. Insertar persona
            const insertPersonaResult = await pool.query(
                `INSERT INTO persona (documento, nombres, apellidos, correo, direccion, telefono, tipo_doc, contraseña) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 ON CONFLICT (documento) DO NOTHING
                 RETURNING documento`,
                [user.documento, user.nombres, user.apellidos, user.correo, user.direccion, user.telefono, user.tipo_doc, hashedPassword]
            );

            if (insertPersonaResult.rows.length > 0) {
                console.log(`✅ Persona creada: ${user.correo} (Doc: ${user.documento})`);

                // 3. Insertar en rol_persona
                await pool.query(
                    `INSERT INTO rol_persona (rol_id, doc_persona, sede_id) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (rol_id, doc_persona) DO NOTHING`,
                    [rolId, user.documento, sedeId]
                );
                
                console.log(`   ✓ Rol asignado: ${user.rolNombre}\n`);
            } else {
                console.log(`⚠️  Persona ya existe: ${user.correo}\n`);
            }
        }

        console.log('🎉 ¡Proceso completado!');
        console.log('\n📋 Usuarios disponibles:');
        usuarios.forEach(u => {
            console.log(`   ${u.correo} - ${u.password} (${u.rolNombre})`);
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
