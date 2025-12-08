import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/solicitudes/[id]/autorizar-salida
 * 
 * El vigilante autoriza la salida de bienes
 * - Verifica que la solicitud esté aprobada (2 firmas)
 * - Registra firma de salida del vigilante
 * - Cambia estado a 'autorizada'
 * - Bloquea los bienes
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
      // 1. Verificar que la solicitud existe y está aprobada
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

      if (estadoActual !== 'aprobada') {
        await query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'La solicitud debe estar aprobada para autorizar salida' },
          { status: 400 }
        );
      }

      // 2. Verificar que no haya una firma de salida previa
      const firmaExistente = await query(
        `SELECT id FROM firma_solicitud 
         WHERE solicitud_id = $1 AND rol_usuario = 'vigilante_salida'`,
        [parseInt(id)]
      );

      if (firmaExistente.rows.length > 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'La salida ya fue autorizada' },
          { status: 400 }
        );
      }

      // 3. Registrar firma de salida del vigilante
      await query(`
        INSERT INTO firma_solicitud (solicitud_id, rol_usuario, doc_persona, firma, observacion)
        VALUES ($1, 'vigilante_salida', $2, true, $3)
      `, [parseInt(id), documento, observacion || 'Salida autorizada']);

      // 4. Actualizar estado de la solicitud
      await query(
        'UPDATE solicitudes SET estado = $1 WHERE id = $2',
        ['autorizada', parseInt(id)]
      );

      // 5. Asegurar que los bienes estén bloqueados
      // (Ya deberían estar bloqueados desde la firma del cuentadante, pero por seguridad)
      await query(`
        UPDATE asignaciones 
        SET bloqueado = true 
        WHERE id IN (
          SELECT asignacion_id 
          FROM detalle_solicitud 
          WHERE solicitud_id = $1
        )
      `, [parseInt(id)]);

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Salida autorizada exitosamente'
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error al autorizar salida:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la autorización' },
      { status: 500 }
    );
  }
}
