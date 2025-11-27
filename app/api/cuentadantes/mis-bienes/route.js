import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado") || "";

    if (!usuarioId) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    let sqlQuery = `
      SELECT 
        b.id,
        b.codigo,
        b.nombre,
        b.descripcion,
        b.categoria,
        m.nombre as marca_nombre,
        b.modelo,
        b.serial,
        b.estado,
        b.fecha_compra,
        e.nombre as edificio,
        cf.nombre as centro_formacion,
        amb.nombre as ambiente
      FROM bienes b
      LEFT JOIN marcas m ON b.marca_id = m.id
      LEFT JOIN edificios e ON b.edificio_id = e.id
      LEFT JOIN centros_formacion cf ON b.centro_formacion_id = cf.id
      LEFT JOIN ambientes amb ON b.ambiente_id = amb.id
      WHERE b.cuentadante_id = $1
    `;

    const params = [usuarioId];
    let paramCount = 2;

    // Filtro de búsqueda
    if (search) {
      sqlQuery += ` AND (
        b.codigo ILIKE $${paramCount} OR 
        b.nombre ILIKE $${paramCount} OR
        b.modelo ILIKE $${paramCount} OR
        b.serial ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filtro de estado
    if (estado) {
      sqlQuery += ` AND LOWER(REPLACE(b.estado::text, ' ', '_')) = $${paramCount}`;
      params.push(estado.toLowerCase().replace(/ /g, "_"));
      paramCount++;
    }

    sqlQuery += " ORDER BY b.created_at DESC";

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      bienes: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener mis bienes:", error);
    return NextResponse.json(
      { success: false, error: "Error al cargar los bienes" },
      { status: 500 }
    );
  }
}
