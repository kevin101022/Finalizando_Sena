import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Obtener detalles de la solicitud
    const sqlQuery = `
      SELECT 
        ds.id,
        ds.cantidad,
        ds.categoria,
        ds.descripcion
      FROM detalle_solicitud ds
      WHERE ds.solicitud_id = $1
      ORDER BY ds.id
    `;

    const detallesResult = await query(sqlQuery, [id]);

    // Obtener estado de firmas
    const firmasQuery = `
      SELECT 
        rol_firmante,
        estado,
        fecha_firma,
        observaciones,
        u.nombre as firmante_nombre
      FROM firmas_solicitud fs
      INNER JOIN usuarios u ON fs.usuario_id = u.id
      WHERE solicitud_id = $1
    `;

    const firmasResult = await query(firmasQuery, [id]);

    return NextResponse.json({
      success: true,
      detalles: detallesResult.rows,
      firmas: firmasResult.rows
    });

  } catch (error) {
    console.error('Error al obtener detalles:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar detalles' },
      { status: 500 }
    );
  }
}
