import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener lista de usuarios con rol 'cuentadante' activos
    const sqlQuery = `
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.centro_formacion_id,
        u.edificio_id,
        cf.nombre as centro_formacion,
        e.nombre as edificio
      FROM usuarios u
      LEFT JOIN centros_formacion cf ON u.centro_formacion_id = cf.id
      LEFT JOIN edificios e ON u.edificio_id = e.id
      WHERE u.rol = 'cuentadante' AND u.activo = true
      ORDER BY u.nombre
    `;

    const result = await query(sqlQuery, []);

    return NextResponse.json({
      success: true,
      cuentadantes: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener cuentadantes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los cuentadantes',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
