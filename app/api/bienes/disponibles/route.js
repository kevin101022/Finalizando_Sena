import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener bienes disponibles (sin cuentadante asignado)
    const sqlQuery = `
      SELECT 
        id,
        codigo,
        nombre,
        descripcion,
        categoria,
        marca,
        modelo,
        serial,
        valor_compra,
        fecha_compra
      FROM bienes
      WHERE estado = 'disponible' 
        AND cuentadante_id IS NULL
      ORDER BY nombre
    `;

    const result = await query(sqlQuery, []);

    return NextResponse.json({
      success: true,
      bienes: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener bienes disponibles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los bienes disponibles',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
