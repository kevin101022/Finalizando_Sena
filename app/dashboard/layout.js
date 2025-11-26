'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

/**
 * Layout compartido para todas las rutas de /dashboard
 * Incluye Header + Sidebar que aparecen en todas las vistas
 */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Cargar usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  // Función para cambiar de rol
  const handleCambiarRol = async (nuevoRolId) => {
    try {
      const response = await fetch('/api/auth/cambiar-rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoRolId })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        alert(data.error || 'Error al cambiar de rol');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar de rol');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Mostrar loader mientras carga el usuario
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Botón Hamburguesa */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                aria-label="Toggle sidebar"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold">SENA - Gestión de Bienes</h1>
                <p className="text-sm opacity-90">Sistema de Control de Activos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user.nombre}</p>
                <p className="text-xs opacity-90 capitalize">{user.rol}</p>
                {/* Selector de roles si tiene múltiples */}
                {user.rolesDisponibles && user.rolesDisponibles.length > 0 && (
                  <select 
                    onChange={(e) => handleCambiarRol(Number(e.target.value))}
                    value={user.rolActual?.id || ''}
                    className="mt-1 text-xs bg-white/50 border border-white/30 rounded px-2 py-1 text-white"
                  >
                    <option value={user.rolActual?.id}>{user.rolActual?.nombre || user.rol}</option>
                    {user.rolesDisponibles.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          userRole={user.rol} 
          userName={user.nombre} 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Main Content - aquí se renderiza el children (las páginas) */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
