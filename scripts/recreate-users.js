// Script para ACTUALIZAR contraseñas de usuarios existentes
// Este script NO elimina usuarios, solo actualiza sus contraseñas con hashes válidos
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: '123456',
});

const SALT_ROUNDS = 10;

// Usuarios de prueba con sus contraseñas correctas
const usuarios = [
    { email: 'admin@sena.edu.co', password: 'admin123' },
    { email: 'cuentadante@sena.edu.co', password: 'cuenta123' },
    { email: 'almacenista@sena.edu.co', password: 'alma123' },
    { email: 'vigilante@sena.edu.co', password: 'vigi123' },
    { email: 'usuario@sena.edu.co', password: 'user123' },
    { email: 'coordinador@sena.edu.co', password: 'coord123' }
];

async function updatePasswords() {
    console.log('🔧 ACTUALIZANDO contraseñas de usuarios...\n');

    try {
        for (const user of usuarios) {
            console.log(`Procesando: ${user.email}...`);

            // Hashear la contraseña correctamente
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            console.log(`   Nuevo hash: ${hashedPassword.substring(0, 30)}... (${hashedPassword.length} chars)`);

            // Actualizar la contraseña en la base de datos
            const result = await pool.query(
                `UPDATE usuarios 
                 SET password = $1 
                 WHERE email = $2
                 RETURNING id, nombre`,
                [hashedPassword, user.email]
            );

            if (result.rows.length > 0) {
                console.log(`✅ Contraseña actualizada: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`⚠️  Usuario no encontrado: ${user.email}`);
            }
            console.log('');
        }

        console.log('🎉 ¡Proceso completado!\n');
        console.log('📋 Credenciales de acceso:');
        console.log('┌─────────────────────────────────┬──────────────┐');
        console.log('│ Email                           │ Password     │');
        console.log('├─────────────────────────────────┼──────────────┤');
        usuarios.forEach(u => {
            console.log(`│ ${u.email.padEnd(31)} │ ${u.password.padEnd(12)} │`);
        });
        console.log('└─────────────────────────────────┴──────────────┘');

        console.log('\n✨ Ahora puedes iniciar sesión en http://localhost:3000');
        console.log('🧪 Prueba con: admin@sena.edu.co / admin123');

    } catch (error) {
        console.error('❌ Error al actualizar contraseñas:', error.message);
    } finally {
        await pool.end();
    }
}

updatePasswords();
