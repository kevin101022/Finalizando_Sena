import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener centros de formación
    const centrosResult = await query(
      'SELECT id, nombre, codigo FROM centros_formacion ORDER BY nombre',
      []
    );

    // Obtener edificios con su centro asociado
    const edificiosResult = await query(`
      SELECT 
        e.id, 
        e.nombre, 
        e.codigo, 
        e.centro_formacion_id,
        cf.nombre as centro_nombre
      FROM edificios e
      LEFT JOIN centros_formacion cf ON e.centro_formacion_id = cf.id
      ORDER BY e.nombre
    `, []);

    return NextResponse.json({
      success: true,
      centros: centrosResult.rows,
      edificios: edificiosResult.rows
    });

  } catch (error) {
    console.error('Error al obtener edificios y centros:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener edificios y centros',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
