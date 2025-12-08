'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import RoleSwitcher from '@/app/components/RoleSwitcher';
import { ToastProvider } from '@/app/components/Toast';
import { ConfirmProvider } from '@/app/components/ConfirmDialog';

/**
 * Layout compartido para todas las rutas de /dashboard
 * Incluye Header + Sidebar que aparecen en todas las vistas
 */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Inicializar sidebar según tamaño de pantalla
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar tamaño de pantalla al montar
  useEffect(() => {
    const handleResize = () => {
      // En pantallas grandes (md: 768px), abrir sidebar por defecto
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Ejecutar al montar
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Actualizar estado local
        setUser(data.user);
        
        // Redirigir al dashboard principal para mostrar el dashboard del nuevo rol
        router.push('/dashboard');
        
        // Recargar la página para asegurar que todo se actualice correctamente
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        alert(data.error || 'Error al cambiar de rol');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar de rol');
    }
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
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header - Responsive */}
          <header className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white shadow-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Botón Hamburguesa */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
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
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate">SENA - Gestión de Bienes</h1>
                <p className="text-xs sm:text-sm opacity-90 hidden sm:block">Sistema de Control de Activos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold">{user.nombre}</p>
                <p className="text-xs opacity-90">
                  {user.correo || user.documento}
                </p>
              </div>
              
              {/* Componente elegante de cambio de rol */}
              <RoleSwitcher user={user} onRoleChange={handleCambiarRol} />
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
      </ConfirmProvider>
    </ToastProvider>
  );
}
