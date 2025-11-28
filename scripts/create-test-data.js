// Script para crear datos de prueba (sedes y ambientes)
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: '123456',
});

async function createTestData() {
    console.log('🚀 Creando datos de prueba...\n');

    try {
        // Verificar si ya existen sedes
        const sedesExistentes = await pool.query('SELECT COUNT(*) as total FROM sedes');
        
        if (parseInt(sedesExistentes.rows[0].total) === 0) {
            console.log('📍 Creando sedes...');
            
            // Insertar sedes
            const sedes = [
                'Sede Principal',
                'Sede Norte',
                'Sede Sur',
                'Sede Centro'
            ];

            for (const sede of sedes) {
                const result = await pool.query(
                    'INSERT INTO sedes (nombre) VALUES ($1) RETURNING id',
                    [sede]
                );
                console.log(`✅ Sede creada: ${sede} (ID: ${result.rows[0].id})`);
            }
        } else {
            console.log('📍 Sedes ya existen, saltando...');
        }

        // Verificar si ya existen ambientes
        const ambientesExistentes = await pool.query('SELECT COUNT(*) as total FROM ambientes');
        
        if (parseInt(ambientesExistentes.rows[0].total) === 0) {
            console.log('\n🏢 Creando ambientes...');
            
            // Obtener la primera sede
            const primeraSedeResult = await pool.query('SELECT id FROM sedes LIMIT 1');
            const sedeId = primeraSedeResult.rows[0].id;

            // Insertar ambientes
            const ambientes = [
                'Ambiente 101 - Sistemas',
                'Ambiente 102 - Redes',
                'Ambiente 201 - Programación',
                'Ambiente 202 - Base de Datos',
                'Ambiente 301 - Multimedia',
                'Laboratorio de Hardware',
                'Sala de Conferencias',
                'Biblioteca'
            ];

            for (const ambiente of ambientes) {
                const result = await pool.query(
                    'INSERT INTO ambientes (nombre, sede_id) VALUES ($1, $2) RETURNING id',
                    [ambiente, sedeId]
                );
                console.log(`✅ Ambiente creado: ${ambiente} (ID: ${result.rows[0].id})`);
            }
        } else {
            console.log('🏢 Ambientes ya existen, saltando...');
        }

        console.log('\n🎉 ¡Datos de prueba creados exitosamente!');

    } catch (error) {
        console.error('❌ Error al crear datos de prueba:', error);
        console.error('Detalles:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar el script
createTestData();
