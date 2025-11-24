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

    // 5. Generar JWT token
    const token = generateToken(user);

    // 6. Preparar respuesta (sin enviar la contraseña)
    // Usamos destructuring para eliminar el campo password
    const { password: _, ...userWithoutPassword } = user;

    // 7. Crear respuesta
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    // 8. Guardar token en una cookie HttpOnly (opcional pero más seguro que localStorage)
    // HttpOnly = la cookie NO es accesible desde JavaScript del cliente
    // Esto previene ataques XSS (Cross-Site Scripting)
    response.cookies.set('token', token, {
      httpOnly: true, // No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // Protección contra CSRF
      maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
      path: '/' // Disponible en toda la aplicación
    });

    console.log('✅ Login exitoso:', user.email, '-', user.rol);

    return response;

  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
