import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const documento = searchParams.get('documento');

    let sqlQuery = `
      SELECT 
        s.id,
        s.fecha_ini_prestamo,
        s.fecha_fin_prestamo,
        s.motivo,
        s.observaciones,
        s.estado,
        s.destino,
        s.created_at,
        p.nombres || ' ' || p.apellidos as solicitante_nombre,
        sed.nombre as sede_nombre
      FROM solicitudes s
      JOIN persona p ON s.doc_persona = p.documento
      LEFT JOIN sedes sed ON s.sede_id = sed.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Si es instructor, solo ve sus solicitudes
    if (rol === 'instructor' && documento) {
      sqlQuery += ` AND s.doc_persona = $${paramCount}`;
      params.push(documento);
      paramCount++;
    }

    sqlQuery += ' ORDER BY s.created_at DESC';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      solicitudes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar solicitudes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      doc_persona, 
      sede_id, 
      motivo, 
      fecha_inicio, 
      fecha_fin, 
      observaciones, 
      detalles, // Array de items solicitados { categoria, cantidad, descripcion }
      destino
    } = body;

    // Validaciones
    if (!doc_persona || !sede_id || !motivo || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Procesar detalles para guardarlos en observaciones (ya que detalle_solicitud es para asignaciones)
    let resumenDetalles = '';
    if (detalles && detalles.length > 0) {
      resumenDetalles = '\n\nItems Solicitados:\n' + detalles.map(d => 
        `- ${d.cantidad}x ${d.categoria} (${d.descripcion || 'Sin descripción'})`
      ).join('\n');
    }

    const observacionesFinal = (observaciones || '') + resumenDetalles;

    // Insertar Solicitud
    const insertQuery = `
      INSERT INTO solicitudes (
        doc_persona, 
        sede_id, 
        motivo, 
        fecha_ini_prestamo, 
        fecha_fin_prestamo, 
        observaciones,
        destino,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
      RETURNING id
    `;
    
    const result = await query(insertQuery, [
      doc_persona,
      parseInt(sede_id),
      motivo,
      fecha_inicio,
      fecha_fin,
      observacionesFinal,
      destino || null
    ]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud creada exitosamente',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', detail: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, estado, observacion_respuesta } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { success: false, error: 'ID y estado son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar estado
    const updateQuery = `
      UPDATE solicitudes 
      SET estado = $1, observaciones = observaciones || $2
      WHERE id = $3
      RETURNING *
    `;

    const obsAdicional = observacion_respuesta ? `\n\nRespuesta: ${observacion_respuesta}` : '';

    const result = await query(updateQuery, [estado, obsAdicional, id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      solicitud: result.rows[0],
      message: `Solicitud ${estado} exitosamente`
    });

  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la solicitud' },
      { status: 500 }
    );
  }
}
