// Script para crear Sedes y Ambientes de prueba en PostgreSQL
// 
// CÓMO EJECUTAR:
// 1. Asegúrate de tener las dependencias instaladas (npm install)
// 2. Ejecuta: npm run create-locations (una vez agregado al package.json)
//
// Este script creará sedes y ambientes básicos para pruebas.

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración de la base de datos
const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'sena_bienes',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '123456',
        }
);

const sedes = [
    { nombre: 'Sede Principal', direccion: 'Calle 52 # 2bis-15' },
    { nombre: 'Sede Pescadero', direccion: 'Av. Las Americas # 12-45' }
];

const ambientes = [
    { nombre: 'Ambiente 201 - Sistemas', codigo: '201', de_sede: 'Sede Principal' },
    { nombre: 'Ambiente 202 - Redes', codigo: '202', de_sede: 'Sede Principal' },
    { nombre: 'Taller de Mecánica', codigo: 'T-MEC', de_sede: 'Sede Pescadero' },
    { nombre: 'Auditorio', codigo: 'AUD-1', de_sede: 'Sede Pescadero' }
];

async function createLocations() {
    console.log('🚀 Iniciando creación de Sedes y Ambientes...\n');

    try {
        // 1. Crear Sedes
        const sedesMap = {}; // Para guardar ID de sedes creadas

        for (const sede of sedes) {
            // Insertar o recuperar sede
            // Usamos ON CONFLICT DO UPDATE para asegurar que obtenemos (o actualizamos) y podemos hacer RETURNING
            // Pero sedes(nombre) debe ser UNIQUE para que ON CONFLICT funcione por nombre.
            // Asumiremos que el nombre es la clave lógica.

            // Verificamos si existe primero para evitar complicaciones con IDs autoincrementales y conflictos
            let res = await pool.query('SELECT id FROM sedes WHERE nombre = $1', [sede.nombre]);

            if (res.rows.length === 0) {
                console.log(`📍 Creando sede: ${sede.nombre}...`);
                res = await pool.query(
                    'INSERT INTO sedes (nombre, direccion) VALUES ($1, $2) RETURNING id',
                    [sede.nombre, sede.direccion]
                );
                console.log(`   ✅ Creada con ID: ${res.rows[0].id}`);
            } else {
                console.log(`📍 Sede existente: ${sede.nombre} (ID: ${res.rows[0].id})`);
            }

            sedesMap[sede.nombre] = res.rows[0].id;
        }

        console.log('\n-----------------------------------\n');

        // 2. Crear Ambientes
        for (const amb of ambientes) {
            const sedeId = sedesMap[amb.de_sede];

            if (!sedeId) {
                console.warn(`⚠️  No se encontró la sede "${amb.de_sede}" para el ambiente "${amb.nombre}". Saltando.`);
                continue;
            }

            // Verificar si existe el ambiente en esa sede
            const resAmb = await pool.query(
                'SELECT id FROM ambientes WHERE nombre = $1 AND sede_id = $2',
                [amb.nombre, sedeId]
            );

            if (resAmb.rows.length === 0) {
                console.log(`🏫 Creando ambiente: ${amb.nombre} (${amb.de_sede})...`);
                await pool.query(
                    'INSERT INTO ambientes (nombre, codigo, sede_id) VALUES ($1, $2, $3)',
                    [amb.nombre, amb.codigo, sedeId]
                );
                console.log(`   ✅ Creado éxitosamente.`);
            } else {
                console.log(`🏫 Ambiente existente: ${amb.nombre}`);
            }
        }

        console.log('\n🎉 ¡Proceso de creación de lugares completado!');

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await pool.end();
    }
}

createLocations();
