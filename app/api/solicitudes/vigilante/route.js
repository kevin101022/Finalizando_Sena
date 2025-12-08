import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/solicitudes/vigilante
 * 
 * Obtiene solicitudes para el vigilante según el tipo:
 * - pendientes: Solicitudes aprobadas esperando autorización de salida
 * - autorizadas: Solicitudes con salida autorizada (bienes en préstamo)
 * - historial: Todas las solicitudes procesadas por el vigilante
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'pendientes';

    let sqlQuery = '';
    let params = [];

    if (tipo === 'pendientes') {
      // Solicitudes aprobadas esperando autorización de salida
      sqlQuery = `
        SELECT 
          s.id,
          s.fecha_ini_prestamo,
          s.fecha_fin_prestamo,
          s.destino,
          s.motivo,
          s.estado,
          p.nombres || ' ' || p.apellidos as solicitante_nombre,
          p.documento as solicitante_documento,
          sed.nombre as sede_nombre,
          (SELECT COUNT(*) FROM detalle_solicitud WHERE solicitud_id = s.id) as cantidad_bienes
        FROM solicitudes s
        JOIN persona p ON s.doc_persona = p.documento
        LEFT JOIN sedes sed ON s.sede_id = sed.id
        WHERE s.estado = 'aprobada'
        ORDER BY s.id DESC
      `;
    } else if (tipo === 'autorizadas') {
      // Solicitudes con salida autorizada (en préstamo o esperando devolución)
      sqlQuery = `
        SELECT 
          s.id,
          s.fecha_ini_prestamo,
          s.fecha_fin_prestamo,
          s.destino,
          s.motivo,
          s.estado,
          p.nombres || ' ' || p.apellidos as solicitante_nombre,
          p.documento as solicitante_documento,
          sed.nombre as sede_nombre,
          (SELECT COUNT(*) FROM detalle_solicitud WHERE solicitud_id = s.id) as cantidad_bienes,
          fs.fecha_firmado as fecha_salida
        FROM solicitudes s
        JOIN persona p ON s.doc_persona = p.documento
        LEFT JOIN sedes sed ON s.sede_id = sed.id
        LEFT JOIN firma_solicitud fs ON s.id = fs.solicitud_id AND fs.rol_usuario = 'vigilante_salida'
        WHERE s.estado IN ('autorizada', 'en_prestamo')
        ORDER BY s.id DESC
      `;
    } else if (tipo === 'historial') {
      // Todas las solicitudes procesadas por el vigilante
      sqlQuery = `
        SELECT 
          s.id,
          s.fecha_ini_prestamo,
          s.fecha_fin_prestamo,
          s.destino,
          s.motivo,
          s.estado,
          p.nombres || ' ' || p.apellidos as solicitante_nombre,
          p.documento as solicitante_documento,
          sed.nombre as sede_nombre,
          (SELECT COUNT(*) FROM detalle_solicitud WHERE solicitud_id = s.id) as cantidad_bienes,
          fs_salida.fecha_firmado as fecha_salida,
          fs_entrada.fecha_firmado as fecha_entrada
        FROM solicitudes s
        JOIN persona p ON s.doc_persona = p.documento
        LEFT JOIN sedes sed ON s.sede_id = sed.id
        LEFT JOIN firma_solicitud fs_salida ON s.id = fs_salida.solicitud_id AND fs_salida.rol_usuario = 'vigilante_salida'
        LEFT JOIN firma_solicitud fs_entrada ON s.id = fs_entrada.solicitud_id AND fs_entrada.rol_usuario = 'vigilante_entrada'
        WHERE s.estado IN ('autorizada', 'en_prestamo', 'devuelto')
        ORDER BY s.id DESC
      `;
    }

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      solicitudes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitudes del vigilante:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar solicitudes' },
      { status: 500 }
    );
  }
}
