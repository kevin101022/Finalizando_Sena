// Script para aplicar la migración del campo bloqueado
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: '123456',
});

async function applyMigration() {
    console.log('🚀 Aplicando migración: añadir campo bloqueado...\n');

    try {
        // Verificar si la columna ya existe
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='asignaciones' AND column_name='bloqueado'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('✅ El campo bloqueado ya existe en la tabla asignaciones');
        } else {
            console.log('📝 Añadiendo campo bloqueado a la tabla asignaciones...');
            
            // Añadir columna bloqueado
            await pool.query(`
                ALTER TABLE asignaciones 
                ADD COLUMN bloqueado BOOLEAN DEFAULT false
            `);

            console.log('✅ Campo bloqueado añadido exitosamente');

            // Actualizar registros existentes
            await pool.query(`
                UPDATE asignaciones 
                SET bloqueado = false 
                WHERE bloqueado IS NULL
            `);

            console.log('✅ Registros existentes actualizados');
        }

        console.log('\n🎉 ¡Migración completada exitosamente!');

    } catch (error) {
        console.error('❌ Error al aplicar migración:', error);
        console.error('Detalles:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar el script
applyMigration();
