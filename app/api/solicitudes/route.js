import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      usuario_id, 
      sede_destino_id, 
      motivo, 
      fecha_inicio, 
      fecha_fin, 
      observaciones, 
      detalles 
    } = body;

    // Validaciones básicas
    if (!usuario_id || !sede_destino_id || !motivo || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!detalles || detalles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe agregar al menos un ítem a la solicitud' },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await query('BEGIN');

    try {
      // 1. Insertar Solicitud
      const insertSolicitudQuery = `
        INSERT INTO solicitudes (
          usuario_id, 
          sede_destino_id, 
          motivo, 
          fecha_inicio_prestamo, 
          fecha_fin_prestamo, 
          observaciones,
          estado
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
        RETURNING id
      `;
      
      const solicitudResult = await query(insertSolicitudQuery, [
        usuario_id,
        sede_destino_id,
        motivo,
        fecha_inicio,
        fecha_fin,
        observaciones || null
      ]);

      const solicitudId = solicitudResult.rows[0].id;

      // 2. Insertar Detalles
      const insertDetalleQuery = `
        INSERT INTO detalle_solicitud (
          solicitud_id, 
          categoria, 
          cantidad, 
          descripcion,
          responsable_id
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      for (const item of detalles) {
        await query(insertDetalleQuery, [
          solicitudId,
          item.categoria,
          item.cantidad,
          item.descripcion,
          item.responsable_id
        ]);
      }

      // Confirmar transacción
      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Solicitud creada exitosamente',
        id: solicitudId
      });

    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }

  } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    console.error('   Detalle del error:', error.message);
    console.error('   Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', detail: error.message },
      { status: 500 }
    );
  }
}
