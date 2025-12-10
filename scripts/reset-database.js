/**
 * Script para limpiar completamente la base de datos
 * ADVERTENCIA: Este script eliminará TODOS los datos
 * 
 * Uso: node scripts/reset-database.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Configurar pool con variables individuales o DATABASE_URL
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

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos');
    console.log('⏳ Esperando 3 segundos antes de continuar...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔄 Iniciando limpieza de base de datos...\n');

    await client.query('BEGIN');

    // 1. Verificar qué tablas existen
    console.log('📋 Verificando tablas existentes...');
    const tablasResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tablasExistentes = tablasResult.rows.map(r => r.tablename);
    console.log(`   Encontradas ${tablasExistentes.length} tablas\n`);

    // 2. Eliminar datos de tablas con dependencias (orden importante)
    console.log('🗑️  Eliminando datos de tablas...');

    const tablasOrdenadas = [
      'firma_solicitud',
      'detalle_solicitud',
      'solicitudes',
      'estado_bien',
      'asignaciones',
      'bienes',
      'rol_persona',
      'persona',
      'ambientes',
      'edificios',
      'sedes',
      'marcas',
      'cuentadantes',
      'rol'
    ];

    for (const tabla of tablasOrdenadas) {
      if (tablasExistentes.includes(tabla)) {
        try {
          const result = await client.query(`DELETE FROM ${tabla}`);
          console.log(`   ✅ ${tabla}: ${result.rowCount} registros eliminados`);
        } catch (error) {
          console.log(`   ⚠️  ${tabla}: ${error.message}`);
        }
      } else {
        console.log(`   ⏭️  ${tabla}: no existe`);
      }
    }

    // 3. Reiniciar secuencias (auto-increment)
    console.log('\n🔢 Reiniciando secuencias (auto-increment)...');

    // Obtener todas las secuencias existentes
    const secuenciasResult = await client.query(`
      SELECT sequencename 
      FROM pg_sequences 
      WHERE schemaname = 'public'
    `);

    const secuenciasExistentes = secuenciasResult.rows.map(r => r.sequencename);

    const secuencias = [
      'solicitudes_id_seq',
      'detalle_solicitud_id_seq',
      'firma_solicitud_id_seq',
      'bienes_id_seq',
      'asignaciones_id_seq',
      'estado_bien_id_seq',
      'rol_id_seq',
      'sedes_id_seq',
      'edificios_id_seq',
      'ambientes_id_seq',
      'marcas_id_seq'
    ];

    for (const secuencia of secuencias) {
      if (secuenciasExistentes.includes(secuencia)) {
        try {
          await client.query(`ALTER SEQUENCE ${secuencia} RESTART WITH 1`);
          console.log(`   ✅ ${secuencia} reiniciada`);
        } catch (error) {
          console.log(`   ⚠️  ${secuencia}: ${error.message}`);
        }
      } else {
        console.log(`   ⏭️  ${secuencia}: no existe`);
      }
    }

    // 4. Insertar roles básicos del sistema
    console.log('\n👥 Insertando roles básicos del sistema...');

    // Verificar estructura de la tabla rol
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rol'
    `);

    const columns = columnsResult.rows.map(r => r.column_name);
    const tieneDescripcion = columns.includes('descripcion');

    const roles = [
      { nombre: 'administrador', descripcion: 'Gestiona usuarios, roles y sedes' },
      { nombre: 'coordinador', descripcion: 'Aprueba solicitudes con firma final' },
      { nombre: 'cuentadante', descripcion: 'Responsable de bienes asignados' },
      { nombre: 'almacenista', descripcion: 'Registra y asigna bienes' },
      { nombre: 'vigilante', descripcion: 'Autoriza salidas de bienes' },
      { nombre: 'usuario', descripcion: 'Solicita préstamos de bienes' }
    ];

    for (const rol of roles) {
      if (tieneDescripcion) {
        await client.query(
          'INSERT INTO rol (nombre, descripcion) VALUES ($1, $2)',
          [rol.nombre, rol.descripcion]
        );
      } else {
        await client.query(
          'INSERT INTO rol (nombre) VALUES ($1)',
          [rol.nombre]
        );
      }
      console.log(`   ✅ Rol "${rol.nombre}" created`);
    }

    // 5. Insertar Marcas iniciales
    console.log('\n🏷️  Insertando marcas iniciales...');
    const marcas = ['Generico', 'HP', 'Dell', 'Lenovo', 'Samsung', 'Apple', 'Asus'];
    for (const marca of marcas) {
      await client.query('INSERT INTO marcas (nombre) VALUES ($1)', [marca]);
    }
    console.log(`   ✅ ${marcas.length} marcas insertadas`);

    // 6. Insertar Sedes y Ambientes
    console.log('\n📍 Insertando Sedes y Ambientes...');

    // Lista aumentada de sedes
    const sedesList = ['Sede Pescadero', 'Sede Calzado', 'Sede Comuneros'];
    // Ambientes solicitados + Almacén
    const ambientesList = ['Almacén General', '101', '102', '201', '202'];

    let defaultSedeId = null;

    for (const nombreSede of sedesList) {
      const sedeResult = await client.query(
        "INSERT INTO sedes (nombre) VALUES ($1) RETURNING id",
        [nombreSede]
      );
      const currentSedeId = sedeResult.rows[0].id;

      // Guardar el ID de la primera sede (Sede Principal) para el admin
      if (!defaultSedeId) defaultSedeId = currentSedeId;

      for (const nombreAmbiente of ambientesList) {
        await client.query(
          "INSERT INTO ambientes (nombre, sede_id) VALUES ($1, $2)",
          [nombreAmbiente, currentSedeId]
        );
      }
      console.log(`   ✅ ${nombreSede} creada con ${ambientesList.length} ambientes`);
    }

    // 7. Insertar Usuario Administrador por defecto
    console.log('\n👤 Creando usuario Administrador...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Obtener ID del rol administrador
    const rolAdminResult = await client.query("SELECT id FROM rol WHERE nombre = 'administrador'");
    const rolAdminId = rolAdminResult.rows[0].id;

    await client.query(
      `INSERT INTO persona (documento, nombres, apellidos, correo, direccion, telefono, tipo_doc, contraseña) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['1000000000', 'Administrador', 'Sistema', 'admin@sena.edu.co', 'Dirección Sena', '0000000000', 'CC', hashedPassword]
    );

    await client.query(
      "INSERT INTO rol_persona (rol_id, doc_persona, sede_id) VALUES ($1, $2, $3)",
      [rolAdminId, '1000000000', defaultSedeId]
    );
    console.log('   ✅ Usuario admin@sena.edu.co creado (Pass: admin123)');

    await client.query('COMMIT');

    console.log('\n✅ Base de datos limpiada y refactorizada exitosamente!');
    console.log('\n📊 Estado actual:');
    console.log('   - Tablas limpiadas');
    console.log('   - Roles, Marcas, Sedes y Ambientes creados');
    console.log('   - Usuario Administrador creado');
    console.log('\n🔑 Credenciales Admin:');
    console.log('   Usuario: admin@sena.edu.co');
    console.log('   Clave:   admin123');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Iniciar sesión y configuración inicial');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error al limpiar la base de datos:', error.message);
    console.error('Detalles:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🗑️  LIMPIEZA COMPLETA DE BASE DE DATOS                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\\n');

resetDatabase()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
