import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Obtener parámetros opcionales para filtrar
    const { searchParams } = new URL(request.url);
    const edificio_id = searchParams.get('edificio_id');
    const centro_id = searchParams.get('centro_id');

    let sqlQuery = `
      SELECT 
        a.id,
        a.nombre,
        a.codigo,
        a.edificio_id,
        a.centro_formacion_id,
        e.nombre as edificio_nombre,
        cf.nombre as centro_nombre
      FROM ambientes a
      LEFT JOIN edificios e ON a.edificio_id = e.id
      LEFT JOIN centros_formacion cf ON a.centro_formacion_id = cf.id
      WHERE a.activo = true
    `;

    const params = [];
    let paramCount = 1;

    // Filtrar por edificio si se proporciona
    if (edificio_id) {
      sqlQuery += ` AND a.edificio_id = $${paramCount}`;
      params.push(parseInt(edificio_id));
      paramCount++;
    }

    // Filtrar por centro si se proporciona
    if (centro_id) {
      sqlQuery += ` AND a.centro_formacion_id = $${paramCount}`;
      params.push(parseInt(centro_id));
      paramCount++;
    }

    sqlQuery += ' ORDER BY a.nombre';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      ambientes: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener ambientes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los ambientes',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
