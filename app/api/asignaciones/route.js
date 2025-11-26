import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    const { cuentadante_id, ambiente_id, bienes_ids, asignado_por } = body;
    
    if (!cuentadante_id || !ambiente_id || !bienes_ids || !Array.isArray(bienes_ids) || bienes_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos o bienes_ids debe ser un array con al menos un elemento' },
        { status: 400 }
      );
    }

    if (!asignado_por) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el ID del usuario que realiza la asignación' },
        { status: 400 }
      );
    }

    const observaciones = body.observaciones || null;
    const asignacionesCreadas = [];
    const errores = [];

    // Procesar cada bien
    for (const bien_id of bienes_ids) {
      try {
        // Verificar que el bien esté disponible
        const checkBienQuery = `
          SELECT id, codigo, nombre, estado, cuentadante_id 
          FROM bienes 
          WHERE id = $1
        `;
        const bienResult = await query(checkBienQuery, [bien_id]);

        if (bienResult.rowCount === 0) {
          errores.push({ bien_id, error: 'Bien no encontrado' });
          continue;
        }

        const bien = bienResult.rows[0];

        if (bien.estado !== 'disponible' || bien.cuentadante_id !== null) {
          errores.push({ 
            bien_id, 
            codigo: bien.codigo,
            error: 'El bien no está disponible para asignación' 
          });
          continue;
        }

        // Marcar asignaciones anteriores como inactivas (por si acaso)
        await query(
          `UPDATE asignaciones 
           SET activa = false, fecha_desasignacion = NOW() 
           WHERE bien_id = $1 AND activa = true`,
          [bien_id]
        );

        // Crear nueva asignación
        const insertAsignacionQuery = `
          INSERT INTO asignaciones (
            bien_id, cuentadante_id, ambiente_id, 
            observaciones, asignado_por, activa
          ) VALUES ($1, $2, $3, $4, $5, true)
          RETURNING *
        `;
        
        const asignacionResult = await query(insertAsignacionQuery, [
          bien_id,
          cuentadante_id,
          ambiente_id,
          observaciones,
          asignado_por
        ]);

        // Actualizar el bien
        await query(
          `UPDATE bienes 
           SET cuentadante_id = $1, ambiente_id = $2, updated_at = NOW()
           WHERE id = $3`,
          [cuentadante_id, ambiente_id, bien_id]
        );

        // Registrar en historial de movimientos
        await query(
          `INSERT INTO historial_movimientos (
            bien_id, tipo_movimiento, usuario_responsable_id, descripcion
          ) VALUES ($1, $2, $3, $4)`,
          [
            bien_id,
            'traslado', // Usar 'traslado' (valor válido: prestamo, devolucion, traslado, mantenimiento, baja)
            asignado_por,
            `Asignado a cuentadante ID ${cuentadante_id} en ambiente ID ${ambiente_id}`
          ]
        );

        asignacionesCreadas.push({
          asignacion: asignacionResult.rows[0],
          bien: { id: bien.id, codigo: bien.codigo, nombre: bien.nombre }
        });

      } catch (error) {
        console.error(`Error procesando bien ${bien_id}:`, error);
        errores.push({ bien_id, error: error.message });
      }
    }

    // Respuesta final
    if (asignacionesCreadas.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo asignar ningún bien',
          errores 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${asignacionesCreadas.length} bien(es) asignado(s) exitosamente`,
      asignaciones: asignacionesCreadas,
      errores: errores.length > 0 ? errores : undefined
    });

  } catch (error) {
    console.error('Error al crear asignaciones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear las asignaciones',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bien_id = searchParams.get('bien_id');
    const cuentadante_id = searchParams.get('cuentadante_id');
    const activa = searchParams.get('activa');

    let sqlQuery = `
      SELECT 
        a.id,
        a.bien_id,
        a.cuentadante_id,
        a.ambiente_id,
        a.fecha_asignacion,
        a.fecha_desasignacion,
        a.activa,
        a.observaciones,
        b.codigo as bien_codigo,
        b.nombre as bien_nombre,
        u.nombre as cuentadante_nombre,
        amb.nombre as ambiente_nombre
      FROM asignaciones a
      LEFT JOIN bienes b ON a.bien_id = b.id
      LEFT JOIN usuarios u ON a.cuentadante_id = u.id
      LEFT JOIN ambientes amb ON a.ambiente_id = amb.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (bien_id) {
      sqlQuery += ` AND a.bien_id = $${paramCount}`;
      params.push(parseInt(bien_id));
      paramCount++;
    }

    if (cuentadante_id) {
      sqlQuery += ` AND a.cuentadante_id = $${paramCount}`;
      params.push(parseInt(cuentadante_id));
      paramCount++;
    }

    if (activa !== null && activa !== undefined) {
      sqlQuery += ` AND a.activa = $${paramCount}`;
      params.push(activa === 'true');
      paramCount++;
    }

    sqlQuery += ' ORDER BY a.fecha_asignacion DESC';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      asignaciones: result.rows,
      total: result.rowCount
    });

  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las asignaciones',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
