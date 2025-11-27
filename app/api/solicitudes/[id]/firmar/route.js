import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = await params; // Next.js 15 requiere await
    const body = await request.json();
    const { usuario_id, estado, observaciones } = body;

    // estado debe ser 'aprobado' o 'rechazado'
    if (!usuario_id || !estado || !['aprobado', 'rechazado'].includes(estado)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una firma de cuentadante para esta solicitud
    const checkQuery = `
      SELECT id FROM firmas_solicitud 
      WHERE solicitud_id = $1 AND rol_firmante = 'cuentadante_responsable'
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya has firmado esta solicitud' },
        { status: 400 }
      );
    }

    // Insertar firma
    const insertQuery = `
      INSERT INTO firmas_solicitud (
        solicitud_id,
        usuario_id,
        rol_firmante,
        estado,
        observaciones
      ) VALUES ($1, $2, 'cuentadante_responsable', $3, $4)
      RETURNING *
    `;

    await query(insertQuery, [id, usuario_id, estado, observaciones || null]);

    return NextResponse.json({
      success: true,
      message: `Solicitud ${estado} exitosamente`
    });

  } catch (error) {
    console.error('Error al firmar solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la firma' },
      { status: 500 }
    );
  }
}
