
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local explicitly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Dynamic import
const dbModule = await import('../lib/db.js');
const pool = dbModule.default || dbModule.pool;

async function verifyAmbientes() {
    console.log('🔍 Verificando ambientes creados...\n');

    try {
        const result = await pool.query("SELECT * FROM ambientes WHERE nombre IN ('201', '202', '203', '204', '205') ORDER BY nombre");

        if (result.rows.length > 0) {
            console.log('✅ Ambientes encontrados:');
            console.table(result.rows);
        } else {
            console.log('❌ No se encontraron los ambientes esperados.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verifyAmbientes();
