import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Obtener parámetros de búsqueda y filtros desde la URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoria = searchParams.get('categoria') || '';
    const estado = searchParams.get('estado') || '';

    // Construir query SQL dinámicamente según los filtros
    let sqlQuery = `
      SELECT 
        b.id,
        b.codigo,
        b.nombre,
        b.descripcion,
        b.categoria,
        b.marca,
        b.modelo,
        b.serial,
        b.valor_compra,
        b.fecha_compra,
        b.estado,
        b.observaciones,
        b.cuentadante_id,
        b.ambiente_id,
        cf.nombre as centro_formacion,
        e.nombre as edificio,
        u.nombre as cuentadante_nombre,
        amb.nombre as ambiente_nombre
      FROM bienes b
      LEFT JOIN centros_formacion cf ON b.centro_formacion_id = cf.id
      LEFT JOIN edificios e ON b.edificio_id = e.id
      LEFT JOIN usuarios u ON b.cuentadante_id = u.id
      LEFT JOIN ambientes amb ON b.ambiente_id = amb.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Agregar filtro de búsqueda
    if (search) {
      sqlQuery += ` AND (
        b.codigo ILIKE $${paramCount} OR 
        b.nombre ILIKE $${paramCount} OR
        b.marca ILIKE $${paramCount} OR 
        b.modelo ILIKE $${paramCount} OR
        b.serial ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Agregar filtro de categoría
    if (categoria) {
      sqlQuery += ` AND b.categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    // Agregar filtro de estado
    if (estado) {
      sqlQuery += ` AND b.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    // Ordenar por fecha de creación descendente
    sqlQuery += ' ORDER BY b.created_at DESC';

    // Ejecutar query
    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      bienes: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener bienes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los bienes',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    const requiredFields = ['codigo', 'nombre', 'edificio_id', 'centro_formacion_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insertar nuevo bien en la base de datos
    const insertQuery = `
      INSERT INTO bienes (
        codigo, nombre, descripcion, categoria, marca, modelo, serial,
        valor_compra, fecha_compra, estado, edificio_id, centro_formacion_id,
        observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      body.codigo,
      body.nombre,
      body.descripcion || null,
      body.categoria || null,
      body.marca || null,
      body.modelo || null,
      body.serial || null,
      body.valor_compra || null,
      body.fecha_compra || null,
      body.estado || 'disponible',
      parseInt(body.edificio_id),
      parseInt(body.centro_formacion_id),
      body.observaciones || null
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json({
      success: true,
      bien: result.rows[0],
      message: 'Bien registrado exitosamente'
    });

  } catch (error) {
    console.error('Error al registrar bien:', error);
    
    // Manejar error de código duplicado
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'El código/placa ya existe en el sistema' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al registrar el bien',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

