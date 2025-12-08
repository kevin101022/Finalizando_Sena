'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    documento: '',
    tipo_doc: 'CC',
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento: formData.documento,
          tipo_doc: formData.tipo_doc,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          password: formData.password,
          telefono: formData.telefono,
          direccion: formData.direccion
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrarse');
        setLoading(false);
        return;
      }

      // Registro exitoso - redirigir al login
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      router.push('/');
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#007832] to-[#39A900]">
      {/* Panel izquierdo - Información */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">SENA</h1>
          <h2 className="text-3xl font-semibold mb-4">Sistema de Gestión de Bienes</h2>
          <p className="text-lg opacity-90 mb-6">
            Regístrate para solicitar préstamos de bienes institucionales
          </p>
          <div className="space-y-3 text-sm opacity-80">
            <p>✓ Solicita bienes de forma rápida</p>
            <p>✓ Rastrea el estado de tus solicitudes</p>
            <p>✓ Historial de préstamos</p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de registro */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
          {/* Logo y título móvil */}
          <div className="text-center mb-6 lg:hidden">
            <h1 className="text-3xl font-bold text-[#39A900] mb-2">SENA</h1>
            <p className="text-gray-600">Gestión de Bienes</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">Completa el formulario para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm col-span-2">
                {error}
              </div>
            )}

            {/* Grid de 2 columnas para todos los campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <div>
                <label htmlFor="tipo_doc" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  id="tipo_doc"
                  name="tipo_doc"
                  value={formData.tipo_doc}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>

              {/* Número de Documento */}
              <div>
                <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="1234567890"
                />
              </div>

              {/* Nombres */}
              <div>
                <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres
                </label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Juan Carlos"
                />
              </div>

              {/* Apellidos */}
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Pérez García"
                />
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="3001234567"
                />
              </div>

              {/* Dirección - ancho completo */}
              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Calle 123 #45-67"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#007832] to-[#39A900] text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/" className="text-[#007832] hover:text-[#39A900] font-medium transition">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
