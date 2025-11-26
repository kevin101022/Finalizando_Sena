'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Componente Sidebar Integrado
 * Sidebar que forma parte del layout (no flotante)
 * 
 * Props:
 * - userRole: Rol del usuario
 * - userName: Nombre del usuario
 * - isOpen: Estado de apertura
 * - onToggle: Función para toggle
 */
export default function Sidebar({ userRole, userName, isOpen, onToggle }) {
  const router = useRouter();

  // Definir menús por rol
  const menuItems = {
    almacenista: [
      {
        label: 'Registrar Bien',
        path: '/dashboard/almacenista/registrar',
        icon: '📦'
      },
      {
        label: 'Asignar a Cuentadante',
        path: '/dashboard/almacenista/asignar-bienes',
        icon: '👤'
      },
      {
        label: 'Inventario Completo',
        path: '/dashboard/almacenista/inventario',
        icon: '📋'
      }
    ],
    cuentadante: [
      {
        label: 'Mis Bienes Asignados',
        path: '/dashboard/cuentadante/bienes',
        icon: '📦'
      },
      {
        label: 'Solicitudes',
        path: '/dashboard/cuentadante/solicitudes',
        icon: '📝'
      }
    ],
    administrador: [
      {
        label: 'Usuarios',
        path: '/dashboard/admin/usuarios',
        icon: '👥'
      },
      {
        label: 'Configuración',
        path: '/dashboard/admin/config',
        icon: '⚙️'
      }
    ],
    coordinador: [
      {
        label: 'Solicitudes',
        path: '/dashboard/coordinador/solicitudes',
        icon: '📝'
      },
      {
        label: 'Reportes',
        path: '/dashboard/coordinador/reportes',
        icon: '📊'
      }
    ],
    vigilante: [
      {
        label: 'Autorizar Salidas',
        path: '/dashboard/vigilante/salidas',
        icon: '🚪'
      },
      {
        label: 'Historial',
        path: '/dashboard/vigilante/historial',
        icon: '📜'
      }
    ],
    usuario: [
      {
        label: 'Nueva Solicitud',
        path: '/dashboard/usuario/solicitar',
        icon: '➕'
      },
      {
        label: 'Mis Solicitudes',
        path: '/dashboard/usuario/solicitudes',
        icon: '📋'
      }
    ]
  };

  const currentMenu = menuItems[userRole] || [];

  return (
    <aside
      className={`bg-gradient-to-b from-[#39A900] to-[#007832] text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden flex-shrink-0`}
    >
      <div className="flex flex-col h-full">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm opacity-90">Usuario</p>
              <p className="font-semibold text-sm truncate">{userName}</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {/* Link a Dashboard - siempre visible para todos los roles */}
            <li>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-left group border-b border-white/10 mb-2"
              >
                <span className="text-2xl">🏠</span>
                <span className="font-medium group-hover:translate-x-1 transition-transform whitespace-nowrap">
                  Inicio / Dashboard
                </span>
              </button>
            </li>
            
            {currentMenu.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all text-left group"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
