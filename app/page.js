'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    documento: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Guardar usuario en localStorage (temporal, luego usarás JWT)
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir al dashboard
      router.push('/dashboard');
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
    setError(''); // Limpiar error al escribir
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#007832] to-[#39A900]">
      {/* Panel izquierdo - Información */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">SENA</h1>
          <h2 className="text-3xl font-semibold mb-4">Sistema de Gestión de Bienes</h2>
          <p className="text-lg opacity-90">
            Plataforma integral para el control y administración de activos institucionales
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo y título móvil */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-[#39A900] mb-2">SENA</h1>
            <p className="text-gray-600">Gestión de Bienes</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Campo de documento */}
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
                placeholder="Ej: 1234567890"
              />
            </div>

            {/* Campo de contraseña */}
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
            </div>

            {/* Recordar y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#39A900] border-gray-300 rounded focus:ring-[#39A900]"
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-[#007832] hover:text-[#39A900] transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#007832] to-[#39A900] text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{' '}
              <a href="#" className="text-[#007832] hover:text-[#39A900] font-medium transition">
                Contacta soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
