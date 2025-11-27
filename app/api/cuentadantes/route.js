import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Listar cuentadantes que tienen bienes disponibles
    const sqlQuery = `
      SELECT DISTINCT 
        u.id,
        u.nombre,
        u.email,
        COUNT(b.id) as bienes_disponibles
      FROM usuarios u
      INNER JOIN bienes b ON b.cuentadante_id = u.id
      WHERE LOWER(b.estado::text) = 'disponible'
      GROUP BY u.id, u.nombre, u.email
      HAVING COUNT(b.id) > 0
      ORDER BY u.nombre ASC
    `;

    const result = await query(sqlQuery);

    return NextResponse.json({
      success: true,
      cuentadantes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener cuentadantes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar cuentadantes' },
      { status: 500 }
    );
  }
}
