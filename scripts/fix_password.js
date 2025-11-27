const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' }); // Intentar cargar .env.local si existe

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sgb_sena',
  password: process.env.DB_PASSWORD || '123456', // Ajusta si es diferente
  port: process.env.DB_PORT || 5432,
});

async function fixPassword(documento, nuevaPassword) {
  try {
    console.log(`Iniciando reparación de contraseña para documento: ${documento}`);
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    
    console.log('Contraseña hasheada correctamente.');

    // Actualizar en BD
    const query = 'UPDATE persona SET contraseña = $1 WHERE documento = $2 RETURNING *';
    const res = await pool.query(query, [hashedPassword, documento]);

    if (res.rowCount > 0) {
      console.log(`✅ Contraseña actualizada exitosamente para el usuario: ${res.rows[0].nombres} ${res.rows[0].apellidos}`);
      console.log(`Nueva contraseña (texto plano): ${nuevaPassword}`);
    } else {
      console.log('❌ No se encontró ningún usuario con ese documento.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

// Ejecutar
const documento = '1005025606';
const password = '123456'; // Contraseña temporal
fixPassword(documento, password);
