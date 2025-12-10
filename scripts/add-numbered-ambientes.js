
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local explicitly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading .env.local from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD); // Un-comment to see password if needed

// Dynamic import to ensure env vars are loaded BEFORE lib/db.js is evaluated
const dbModule = await import('../lib/db.js');
const pool = dbModule.default || dbModule.pool;

if (!pool) {
    console.error('❌ Could not import pool from lib/db.js');
    process.exit(1);
}

async function addNumberedAmbientes() {
    console.log('🚀 Iniciando creación de ambientes numerados de ejemplo...\n');

    try {
        // 1. Obtener una sede válida (la primera que encontremos)
        let sedeId;
        const sedeResult = await pool.query('SELECT id FROM sedes LIMIT 1');

        if (sedeResult.rows.length > 0) {
            sedeId = sedeResult.rows[0].id;
            console.log(`✅ Usando sede existente con ID: ${sedeId}`);
        } else {
            console.log('⚠️ No se encontraron sedes. Creando "Sede Principal"...');
            const newSede = await pool.query('INSERT INTO sedes (nombre) VALUES ($1) RETURNING id', ['Sede Principal']);
            sedeId = newSede.rows[0].id;
            console.log(`✅ Sede creada con ID: ${sedeId}`);
        }

        // 2. Lista de ambientes a crear
        const ambientesNuevos = ['201', '202', '203', '204', '205'];

        // 3. Insertar ambientes
        for (const nombre of ambientesNuevos) {
            // Verificar si ya existe para no duplicar
            const check = await pool.query('SELECT id FROM ambientes WHERE nombre = $1 AND sede_id = $2', [nombre, sedeId]);

            if (check.rows.length === 0) {
                const result = await pool.query(
                    'INSERT INTO ambientes (nombre, sede_id) VALUES ($1, $2) RETURNING id',
                    [nombre, sedeId]
                );
                console.log(`✅ Ambiente creado: ${nombre} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`ℹ️ El ambiente ${nombre} ya existe.`);
            }
        }

        console.log('\n🎉 ¡Proceso finalizado con éxito!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

addNumberedAmbientes();
