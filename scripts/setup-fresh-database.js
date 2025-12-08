/**
 * Script maestro para configurar una base de datos limpia desde cero
 * 
 * Este script ejecuta en orden:
 * 1. Limpieza completa de la base de datos
 * 2. Creación de usuarios de prueba
 * 3. Creación de datos de prueba (opcional)
 * 
 * Uso: node scripts/setup-fresh-database.js
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function ejecutarScript(comando, descripcion) {
  console.log(`\n🔄 ${descripcion}...`);
  try {
    execSync(comando, { stdio: 'inherit' });
    console.log(`✅ ${descripcion} completado\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${descripcion}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 CONFIGURACIÓN DE BASE DE DATOS LIMPIA                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('⚠️  ADVERTENCIA: Este proceso eliminará TODOS los datos actuales\n');
  
  const respuesta = await question('¿Estás seguro de continuar? (escribe "SI" para confirmar): ');
  
  if (respuesta.toUpperCase() !== 'SI') {
    console.log('\n❌ Operación cancelada');
    rl.close();
    process.exit(0);
  }

  console.log('\n📋 Proceso a ejecutar:');
  console.log('   1. Limpiar base de datos');
  console.log('   2. Crear usuarios de prueba');
  console.log('   3. Crear datos de prueba (opcional)\n');

  // Paso 1: Limpiar base de datos
  const paso1 = ejecutarScript(
    'node scripts/reset-database.js',
    'Limpiando base de datos'
  );

  if (!paso1) {
    console.log('\n❌ No se pudo completar la limpieza. Abortando...');
    rl.close();
    process.exit(1);
  }

  // Paso 2: Crear usuarios de prueba
  const crearUsuarios = await question('\n¿Deseas crear usuarios de prueba? (S/N): ');
  
  if (crearUsuarios.toUpperCase() === 'S') {
    ejecutarScript(
      'node scripts/create-test-users.js',
      'Creando usuarios de prueba'
    );
  }

  // Paso 3: Crear datos de prueba
  const crearDatos = await question('\n¿Deseas crear datos de prueba (sedes, bienes, etc.)? (S/N): ');
  
  if (crearDatos.toUpperCase() === 'S') {
    ejecutarScript(
      'node scripts/create-test-data.js',
      'Creando datos de prueba'
    );
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ CONFIGURACIÓN COMPLETADA                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🎉 Base de datos configurada exitosamente!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Inicia el servidor: npm run dev');
  console.log('   2. Accede a: http://localhost:3000');
  
  if (crearUsuarios.toUpperCase() === 'S') {
    console.log('\n👥 Usuarios de prueba disponibles:');
    console.log('   - admin@sena.edu.co / admin123 (Administrador)');
    console.log('   - coordinador@sena.edu.co / coord123 (Coordinador)');
    console.log('   - cuentadante@sena.edu.co / cuenta123 (Cuentadante)');
    console.log('   - almacenista@sena.edu.co / alma123 (Almacenista)');
    console.log('   - vigilante@sena.edu.co / vigi123 (Vigilante)');
    console.log('   - usuario@sena.edu.co / user123 (Usuario)');
  }

  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('\n💥 Error fatal:', error);
  rl.close();
  process.exit(1);
});
