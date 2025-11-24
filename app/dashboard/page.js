'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Componentes de dashboard según rol
const DashboardCuentadante = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Solicitudes Pendientes" value="8" color="from-orange-500 to-orange-600" />
    <StatCard title="Bienes Bajo Mi Cuidado" value="45" color="from-[#39A900] to-[#007832]" />
    <StatCard title="Aprobadas Este Mes" value="23" color="from-[#007832] to-[#39A900]" />
    <ActionCard title="Revisar Solicitudes" description="Aprobar o rechazar solicitudes de préstamo" />
    <ActionCard title="Mis Bienes Asignados" description="Ver bienes bajo mi responsabilidad" />
    <ActionCard title="Generar Reportes" description="Reportes de solicitudes aprobadas/rechazadas" />
  </div>
);

const DashboardAdministrador = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Bienes en Mi Edificio" value="234" color="from-[#39A900] to-[#007832]" />
    <StatCard title="Solicitudes Pendientes" value="12" color="from-orange-500 to-orange-600" />
    <StatCard title="Movimientos Hoy" value="8" color="from-purple-500 to-purple-600" />
    <ActionCard title="Revisar Solicitudes" description="Aprobar o rechazar solicitudes de préstamo" />
    <ActionCard title="Bienes del Edificio" description="Ver bienes, entradas y salidas" />
    <ActionCard title="Generar Reportes" description="Reportes de solicitudes y movimientos" />
  </div>
);

const DashboardAlmacenista = ({ router }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Bienes Registrados" value="856" color="from-[#39A900] to-[#007832]" />
    <StatCard title="Sin Asignar" value="23" color="from-orange-500 to-orange-600" />
    <StatCard title="Cuentadantes Activos" value="12" color="from-blue-500 to-blue-600" />
    <ActionCard
      title="Registrar Bien"
      description="Agregar nuevo bien al sistema"
      onClick={() => router.push('/dashboard/almacenista/registrar')}
    />
    <ActionCard 
      title="Asignar a Cuentadante" 
      description="Asignar bienes para su cuidado" 
    />
    <ActionCard 
      title="Inventario Completo" 
      description="Ver todos los bienes registrados"
      onClick={() => router.push('/dashboard/almacenista/inventario')}
    />
  </div>
);

const DashboardVigilante = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Solicitudes Pendientes" value="5" color="from-orange-500 to-orange-600" />
    <StatCard title="Aprobadas (3/3)" value="8" color="from-[#007832] to-[#39A900]" />
    <StatCard title="Rechazadas (< 3)" value="3" color="from-red-500 to-red-600" />
    <ActionCard title="Verificar Solicitudes" description="Revisar aprobaciones de Cuentadante, Admin y Coordinador" />
    <ActionCard title="Autorizar Salida" description="Permitir retiro de bien (solo con 3 firmas)" />
    <ActionCard title="Historial de Salidas" description="Ver movimientos autorizados" />
  </div>
);

const DashboardUsuario = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Solicitudes Activas" value="3" color="from-blue-500 to-blue-600" />
    <StatCard title="Aprobadas" value="5" color="from-[#007832] to-[#39A900]" />
    <StatCard title="Rechazadas" value="2" color="from-red-500 to-red-600" />
    <ActionCard title="Nueva Solicitud" description="Solicitar préstamo de uno o varios bienes" />
    <ActionCard title="Mis Solicitudes" description="Ver estado de mis solicitudes" />
    <ActionCard title="Reintentar Rechazadas" description="Volver a solicitar bienes rechazados" />
  </div>
);

const DashboardCoordinador = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Solicitudes Mi Dependencia" value="15" color="from-[#39A900] to-[#007832]" />
    <StatCard title="Aprobadas Este Mes" value="34" color="from-[#007832] to-[#39A900]" />
    <StatCard title="Rechazadas" value="7" color="from-red-500 to-red-600" />
    <ActionCard title="Revisar Solicitudes" description="Aprobar o rechazar solicitudes de mi centro" />
    <ActionCard title="Mi Centro de Formación" description="Ver solicitudes de mi dependencia" />
    <ActionCard title="Generar Reportes" description="Reportes de solicitudes realizadas/aprobadas/rechazadas" />
  </div>
);

// Componente de tarjeta de estadística
const StatCard = ({ title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
  </div>
);

// Componente de tarjeta de acción
const ActionCard = ({ title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 text-left border border-gray-100 hover:border-[#39A900]"
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(() => {
    // Inicializar estado desde localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  });

  useEffect(() => {
    // Verificar autenticación
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.rol) {
      case 'cuentadante':
        return <DashboardCuentadante />;
      case 'administrador':
        return <DashboardAdministrador />;
      case 'almacenista':
        return <DashboardAlmacenista router={router} />;
      case 'vigilante':
        return <DashboardVigilante />;
      case 'usuario':
        return <DashboardUsuario />;
      case 'coordinador':
        return <DashboardCoordinador />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SENA - Gestión de Bienes</h1>
              <p className="text-sm opacity-90">Sistema de Control de Activos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user.nombre}</p>
                <p className="text-xs opacity-90 capitalize">{user.rol}</p>
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Bienvenido, {user.nombre}
          </h2>
          <p className="text-gray-600">Panel de control - {user.rol}</p>
        </div>

        {renderDashboard()}
      </main>
    </div>
  );
}
