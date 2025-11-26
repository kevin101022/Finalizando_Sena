import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * 
 * Endpoint de autenticación - Permite a los usuarios iniciar sesión
 * 
 * FLUJO:
 * 1. Recibe email y password del cliente
 * 2. Busca el usuario en la base de datos PostgreSQL
 * 3. Verifica la contraseña usando bcrypt
 * 4. Si es correcta, genera un JWT token
 * 5. Retorna el token y los datos del usuario
 * 
 * Body esperado:
 * {
 *   "email": "admin@sena.edu.co",
 *   "password": "admin123"
 * }
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "user": { id, nombre, email, rol, ... },
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 * 
 * Respuesta de error (401):
 * {
 *   "error": "Credenciales incorrectas"
 * }
 */
export async function POST(request) {
  try {
    // 1. Obtener datos del body
    const { email, password } = await request.json();

    // 2. Validar que existan email y password
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // 3. Buscar usuario en la base de datos
    // $1 es un placeholder - PostgreSQL lo reemplaza con el valor de forma segura
    // Esto previene SQL injection
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    );

    // Si no se encontró el usuario
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // 4. Verificar contraseña con bcrypt
    // comparePassword compara la contraseña plana con el hash almacenado
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // 5. Obtener el rol principal del usuario desde la tabla roles
    const rolPrincipalQuery = await query(
      'SELECT * FROM roles WHERE id = $1',
      [user.rol_principal_id]
    );

    if (rolPrincipalQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Error: Usuario sin rol asignado' },
        { status: 500 }
      );
    }

    const rolPrincipal = rolPrincipalQuery.rows[0];

    // 6. Obtener TODOS los roles del usuario (para ver si tiene múltiples)
    const todosLosRolesQuery = await query(`
      SELECT r.*, ur.es_principal 
      FROM roles r
      INNER JOIN usuario_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = $1 AND r.activo = true
      ORDER BY ur.es_principal DESC
    `, [user.id]);

    const todosLosRoles = todosLosRolesQuery.rows;
    
    // Roles secundarios = todos los roles EXCEPTO el principal
    const rolesSecundarios = todosLosRoles.filter(r => r.id !== rolPrincipal.id);

    // 7. Generar JWT token (por ahora, con estructura antigua para no romper nada)
    const token = generateToken({
      ...user,
      rol: rolPrincipal.nombre // Agregamos el nombre del rol para compatibilidad
    });

    // 8. Preparar respuesta (sin enviar la contraseña)
    const { password: _, ...userWithoutPassword } = user;

    // 9. Crear respuesta CON información de roles
    const response = NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        rol: rolPrincipal.nombre, // Nombre del rol actual (para compatibilidad)
        rolActual: rolPrincipal, // Objeto completo del rol actual
        rolesDisponibles: rolesSecundarios // Roles a los que puede cambiar
      },
      token
    });

    // 10. Guardar token en cookie HttpOnly
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ Login exitoso:', user.email, '-', rolPrincipal.nombre);
    if (rolesSecundarios.length > 0) {
      console.log('   Roles adicionales:', rolesSecundarios.map(r => r.nombre).join(', '));
    }

    return response;

  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
