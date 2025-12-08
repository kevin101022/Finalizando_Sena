'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalDetalleSolicitud from '@/app/components/ModalDetalleSolicitud';
import TablaSolicitudes from '@/app/components/TablaSolicitudes';
import { filtrarSolicitudes } from '@/lib/solicitudUtils';

export default function SolicitudesAdministrador() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.rol !== 'administrador') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSolicitudes();
    }
  }, [user]);

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch('/api/solicitudes?rol=administrador');
      const data = await res.json();
      if (data.success) {
        setSolicitudes(data.solicitudes);
        setSolicitudesFiltradas(data.solicitudes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solicitudes cuando cambian los filtros
  useEffect(() => {
    const resultado = filtrarSolicitudes(solicitudes, searchTerm, estadoFiltro);
    setSolicitudesFiltradas(resultado);
  }, [searchTerm, estadoFiltro, solicitudes]);

  const verDetalles = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
  };

  // El administrador ya no puede firmar solicitudes, solo verlas

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
        <p className="text-gray-600">Monitoreo de solicitudes del sistema</p>
      </div>

      <TablaSolicitudes
        solicitudes={solicitudesFiltradas}
        loading={loading}
        onVerDetalles={verDetalles}
        mensajeVacio="No hay solicitudes disponibles"
        mostrarSolicitante={true}
        mostrarAccionExtra={false}
        mostrarFiltros={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        estadoFiltro={estadoFiltro}
        onEstadoChange={setEstadoFiltro}
      />

      {/* Modal de detalles */}
      {solicitudSeleccionada && (
        <ModalDetalleSolicitud
          solicitud={solicitudSeleccionada}
          onClose={() => setSolicitudSeleccionada(null)}
        />
      )}
    </div>
  );
}
