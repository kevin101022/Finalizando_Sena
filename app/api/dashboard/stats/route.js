import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const documento = searchParams.get('documento');

    // Estadísticas para CUENTADANTE
    if (rol === 'cuentadante' && documento) {
      // 1. Bienes a cargo (asignados actualmente a este cuentadante)
      const bienesACargoQuery = `
        SELECT COUNT(*) as total 
        FROM asignaciones 
        WHERE doc_persona = $1
      `;
      const bienesACargoResult = await query(bienesACargoQuery, [documento]);
      const bienesACargo = parseInt(bienesACargoResult.rows[0].total);

      // 2. Bienes disponibles para préstamo (bloqueado = false)
      const bienesDisponiblesQuery = `
        SELECT COUNT(*) as total 
        FROM asignaciones 
        WHERE doc_persona = $1 AND bloqueado = false
      `;
      const bienesDisponiblesResult = await query(bienesDisponiblesQuery, [documento]);
      const bienesDisponibles = parseInt(bienesDisponiblesResult.rows[0].total);

      // 3. Bienes en préstamo (bloqueado = true)
      const bienesEnPrestamoQuery = `
        SELECT COUNT(*) as total 
        FROM asignaciones 
        WHERE doc_persona = $1 AND bloqueado = true
      `;
      const bienesEnPrestamoResult = await query(bienesEnPrestamoQuery, [documento]);
      const bienesEnPrestamo = parseInt(bienesEnPrestamoResult.rows[0].total);

      // 4. Solicitudes pendientes de firmar (que incluyen bienes de este cuentadante)
      const solicitudesPendientesQuery = `
        SELECT COUNT(DISTINCT s.id) as total
        FROM solicitudes s
        JOIN detalle_solicitud ds ON s.id = ds.solicitud_id
        JOIN asignaciones a ON ds.asignacion_id = a.id
        WHERE a.doc_persona = $1 
          AND s.estado = 'pendiente'
      `;
      const solicitudesPendientesResult = await query(solicitudesPendientesQuery, [documento]);
      const solicitudesPendientes = parseInt(solicitudesPendientesResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          bienesACargo,
          bienesDisponibles,
          bienesEnPrestamo,
          solicitudesPendientes
        }
      });
    }

    // Estadísticas para USUARIO
    if (rol === 'usuario' && documento) {
      // 1. Solicitudes activas (pendientes, firmadas, aprobadas)
      const solicitudesActivasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE doc_persona = $1 
          AND estado IN ('pendiente', 'firmada_cuentadante', 'aprobada', 'autorizada')
      `;
      const solicitudesActivasResult = await query(solicitudesActivasQuery, [documento]);
      const solicitudesActivas = parseInt(solicitudesActivasResult.rows[0].total);

      // 2. Solicitudes aprobadas (completamente aprobadas o autorizadas)
      const solicitudesAprobadasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE doc_persona = $1 
          AND estado IN ('aprobada', 'autorizada', 'en_prestamo')
      `;
      const solicitudesAprobadasResult = await query(solicitudesAprobadasQuery, [documento]);
      const solicitudesAprobadas = parseInt(solicitudesAprobadasResult.rows[0].total);

      // 3. Solicitudes rechazadas o canceladas
      const solicitudesRechazadasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE doc_persona = $1 
          AND estado IN ('rechazada', 'cancelada')
      `;
      const solicitudesRechazadasResult = await query(solicitudesRechazadasQuery, [documento]);
      const solicitudesRechazadas = parseInt(solicitudesRechazadasResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          solicitudesActivas,
          solicitudesAprobadas,
          solicitudesRechazadas
        }
      });
    }

    // Estadísticas para COORDINADOR
    if (rol === 'coordinador') {
      // Solicitudes pendientes de firma del coordinador (cuentadante ya firmó)
      const solicitudesPendientesQuery = `
        SELECT COUNT(DISTINCT s.id) as total
        FROM solicitudes s
        WHERE s.estado = 'firmada_cuentadante'
          AND NOT EXISTS (
            SELECT 1 FROM firma_solicitud fs
            WHERE fs.solicitud_id = s.id
              AND fs.rol_usuario = 'coordinador'
          )
      `;
      const solicitudesPendientesResult = await query(solicitudesPendientesQuery);
      const solicitudesPendientes = parseInt(solicitudesPendientesResult.rows[0].total);

      // Solicitudes aprobadas por el coordinador
      const solicitudesAprobadasQuery = `
        SELECT COUNT(*) as total
        FROM firma_solicitud
        WHERE rol_usuario = 'coordinador' AND firma = true
      `;
      const solicitudesAprobadasResult = await query(solicitudesAprobadasQuery);
      const solicitudesAprobadas = parseInt(solicitudesAprobadasResult.rows[0].total);

      // Solicitudes rechazadas por el coordinador
      const solicitudesRechazadasQuery = `
        SELECT COUNT(*) as total
        FROM firma_solicitud
        WHERE rol_usuario = 'coordinador' AND firma = false
      `;
      const solicitudesRechazadasResult = await query(solicitudesRechazadasQuery);
      const solicitudesRechazadas = parseInt(solicitudesRechazadasResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          solicitudesPendientes,
          solicitudesAprobadas,
          solicitudesRechazadas
        }
      });
    }

    // Estadísticas para ADMINISTRADOR
    if (rol === 'administrador') {
      // Total de solicitudes
      const totalSolicitudesQuery = `SELECT COUNT(*) as total FROM solicitudes`;
      const totalSolicitudesResult = await query(totalSolicitudesQuery);
      const totalSolicitudes = parseInt(totalSolicitudesResult.rows[0].total);

      // Total de usuarios en el sistema
      const totalUsuariosQuery = `SELECT COUNT(*) as total FROM persona`;
      const totalUsuariosResult = await query(totalUsuariosQuery);
      const totalUsuarios = parseInt(totalUsuariosResult.rows[0].total);

      // Solicitudes aprobadas (estado = 'aprobada')
      const solicitudesAprobadasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE estado = 'aprobada'
      `;
      const solicitudesAprobadasResult = await query(solicitudesAprobadasQuery);
      const solicitudesAprobadas = parseInt(solicitudesAprobadasResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          totalSolicitudes,
          totalUsuarios,
          solicitudesAprobadas
        }
      });
    }

    // Estadísticas para VIGILANTE
    if (rol === 'vigilante') {
      // Solicitudes aprobadas pendientes de autorización de salida
      const pendientesQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE estado = 'aprobada'
      `;
      const pendientesResult = await query(pendientesQuery);
      const pendientesAutorizacion = parseInt(pendientesResult.rows[0].total);

      // Solicitudes en préstamo (autorizadas o en_prestamo)
      const enPrestamoQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE estado IN ('autorizada', 'en_prestamo')
      `;
      const enPrestamoResult = await query(enPrestamoQuery);
      const enPrestamo = parseInt(enPrestamoResult.rows[0].total);

      // Solicitudes devueltas hoy
      const devueltosQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes s
        JOIN firma_solicitud fs ON s.id = fs.solicitud_id
        WHERE s.estado = 'devuelto'
          AND fs.rol_usuario = 'vigilante_entrada'
          AND DATE(fs.fecha_firmado) = CURRENT_DATE
      `;
      const devueltosResult = await query(devueltosQuery);
      const devueltos = parseInt(devueltosResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          pendientesAutorizacion,
          enPrestamo,
          devueltos
        }
      });
    }

    // Estadísticas GENERALES (Almacenista)
    // Total de bienes registrados
    const totalBienesQuery = `
      SELECT COUNT(*) as total FROM bienes
    `;
    const totalBienesResult = await query(totalBienesQuery, []);
    const totalBienes = parseInt(totalBienesResult.rows[0].total);

    // Bienes sin asignar (sin asignación a ningún cuentadante)
    const bienesSinAsignarQuery = `
      SELECT COUNT(DISTINCT b.id) as total 
      FROM bienes b
      LEFT JOIN asignaciones a ON b.id = a.bien_id
      WHERE a.id IS NULL
    `;
    const bienesSinAsignarResult = await query(bienesSinAsignarQuery, []);
    const bienesSinAsignar = parseInt(bienesSinAsignarResult.rows[0].total);

    // Cuentadantes activos (usando nueva estructura de roles)
    const cuentadantesActivosQuery = `
      SELECT COUNT(DISTINCT p.documento) as total
      FROM persona p
      INNER JOIN rol_persona rp ON p.documento = rp.doc_persona
      INNER JOIN rol r ON rp.rol_id = r.id
      WHERE r.nombre = 'cuentadante'
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
