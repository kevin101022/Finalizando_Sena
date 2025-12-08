import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/solicitudes/[id]/registrar-entrada
 * 
 * El vigilante registra la entrada (devolución) de bienes
 * - Verifica que la solicitud esté autorizada o en préstamo
 * - Registra firma de entrada del vigilante
 * - Cambia estado a 'devuelto'
 * - Desbloquea los bienes
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { documento, observacion } = body;

    if (!documento) {
      return NextResponse.json(
        { success: false, error: 'Documento del vigilante requerido' },
        { status: 400 }
      );
    }

    await query('BEGIN');

    try {
      // 1. Verificar que la solicitud existe y está autorizada o en préstamo
      const solicitudResult = await query(
        'SELECT estado FROM solicitudes WHERE id = $1',
        [parseInt(id)]
      );

      if (solicitudResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Solicitud no encontrada' },
          { status: 404 }
        );
      }

      const estadoActual = solicitudResult.rows[0].estado;

      if (estadoActual !== 'autorizada' && estadoActual !== 'en_prestamo') {
        await query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'La solicitud debe estar autorizada o en préstamo para registrar entrada' },
          { status: 400 }
        );
      }

      // 2. Verificar que no haya una firma de entrada previa
      const firmaExistente = await query(
        `SELECT id FROM firma_solicitud 
         WHERE solicitud_id = $1 AND rol_usuario = 'vigilante_entrada'`,
        [parseInt(id)]
      );

      if (firmaExistente.rows.length > 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'La entrada ya fue registrada' },
          { status: 400 }
        );
      }

      // 3. Registrar firma de entrada del vigilante
      await query(`
        INSERT INTO firma_solicitud (solicitud_id, rol_usuario, doc_persona, firma, observacion)
        VALUES ($1, 'vigilante_entrada', $2, true, $3)
      `, [parseInt(id), documento, observacion || 'Entrada registrada']);

      // 4. Actualizar estado de la solicitud
      await query(
        'UPDATE solicitudes SET estado = $1 WHERE id = $2',
        ['devuelto', parseInt(id)]
      );

      // 5. Desbloquear los bienes de la solicitud
      await query(`
        UPDATE asignaciones 
        SET bloqueado = false 
        WHERE id IN (
          SELECT asignacion_id 
          FROM detalle_solicitud 
          WHERE solicitud_id = $1
        )
      `, [parseInt(id)]);

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Entrada registrada exitosamente'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error al registrar entrada:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}
