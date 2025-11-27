import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const usuarioId = searchParams.get('usuarioId');

    // Estadísticas para CUENTADANTE
    if (rol === 'cuentadante' && usuarioId) {
      // 1. Bienes a cargo (asignados actualmente)
      const bienesACargoQuery = `
        SELECT COUNT(*) as total 
        FROM bienes 
        WHERE cuentadante_id = $1
      `;
      const bienesACargoResult = await query(bienesACargoQuery, [usuarioId]);
      const bienesACargo = parseInt(bienesACargoResult.rows[0].total);

      // 2. Bienes disponibles (de los que tiene a cargo)
      const bienesDisponiblesQuery = `
        SELECT COUNT(*) as total 
        FROM bienes 
        WHERE cuentadante_id = $1 AND estado = 'disponible'
      `;
      const bienesDisponiblesResult = await query(bienesDisponiblesQuery, [usuarioId]);
      const bienesDisponibles = parseInt(bienesDisponiblesResult.rows[0].total);

      // 3. Solicitudes pendientes dirigidas a este cuentadante
      const solicitudesPendientesQuery = `
        SELECT COUNT(DISTINCT s.id) as total
        FROM solicitudes s
        INNER JOIN detalle_solicitud ds ON ds.solicitud_id = s.id
        LEFT JOIN firmas_solicitud fs ON fs.solicitud_id = s.id AND fs.rol_firmante = 'cuentadante_responsable'
        WHERE ds.responsable_id = $1 
          AND s.estado = 'pendiente'
          AND fs.id IS NULL
      `;
      const solicitudesPendientesResult = await query(solicitudesPendientesQuery, [usuarioId]);
      const solicitudesPendientes = parseInt(solicitudesPendientesResult.rows[0].total);

      return NextResponse.json({
        success: true,
        stats: {
          bienesACargo,
          bienesDisponibles,
          solicitudesPendientes
        }
      });
    }

    // Estadísticas para USUARIO
    if (rol === 'usuario' && usuarioId) {
      // 1. Solicitudes activas (pendientes o en proceso)
      const solicitudesActivasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE solicitante_id = $1 
          AND estado IN ('pendiente', 'en_proceso')
      `;
      const solicitudesActivasResult = await query(solicitudesActivasQuery, [usuarioId]);
      const solicitudesActivas = parseInt(solicitudesActivasResult.rows[0].total);

      // 2. Solicitudes aprobadas
      const solicitudesAprobadasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE solicitante_id = $1 
          AND estado = 'aprobada'
      `;
      const solicitudesAprobadasResult = await query(solicitudesAprobadasQuery, [usuarioId]);
      const solicitudesAprobadas = parseInt(solicitudesAprobadasResult.rows[0].total);

      // 3. Solicitudes rechazadas
      const solicitudesRechazadasQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes
        WHERE solicitante_id = $1 
          AND estado = 'rechazada'
      `;
      const solicitudesRechazadasResult = await query(solicitudesRechazadasQuery, [usuarioId]);
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

    // Estadísticas GENERALES (Almacenista/Admin)
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
