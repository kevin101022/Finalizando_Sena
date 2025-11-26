import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Total de bienes registrados
    const totalBienesQuery = `
      SELECT COUNT(*) as total FROM bienes
    `;
    const totalBienesResult = await query(totalBienesQuery, []);
    const totalBienes = parseInt(totalBienesResult.rows[0].total);

    // Bienes sin asignar (sin cuentadante)
    const bienesSinAsignarQuery = `
      SELECT COUNT(*) as total 
      FROM bienes 
      WHERE cuentadante_id IS NULL
    `;
    const bienesSinAsignarResult = await query(bienesSinAsignarQuery, []);
    const bienesSinAsignar = parseInt(bienesSinAsignarResult.rows[0].total);

    // Cuentadantes activos (usando nueva estructura de roles)
    const cuentadantesActivosQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM usuarios u
      INNER JOIN usuario_roles ur ON u.id = ur.usuario_id
      INNER JOIN roles r ON ur.rol_id = r.id
      WHERE r.nombre = 'cuentadante' AND u.activo = true
    `;
    const cuentadantesActivosResult = await query(cuentadantesActivosQuery, []);
    const cuentadantesActivos = parseInt(cuentadantesActivosResult.rows[0].total);

    return NextResponse.json({
      success: true,
      stats: {
        totalBienes,
        bienesSinAsignar,
        cuentadantesActivos
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las estadísticas',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
