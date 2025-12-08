'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalDetalleSolicitud from '@/app/components/ModalDetalleSolicitud';
import TablaSolicitudes from '@/app/components/TablaSolicitudes';
import { useToast } from '@/app/components/Toast';
import { useConfirm } from '@/app/components/ConfirmDialog';
import { filtrarSolicitudes } from '@/lib/solicitudUtils';

export default function HistorialVigilante() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, prompt } = useConfirm();
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
      if (parsedUser.rol !== 'vigilante') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchHistorial();
    }
  }, [user]);

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/solicitudes/vigilante?tipo=historial');
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

  const registrarEntrada = async () => {
    const observacion = await prompt('Observación (opcional):', {
      title: 'Registrar entrada',
      placeholder: 'Ingresa una observación...'
    });
    
    const confirmed = await confirm('¿Confirmar registro de entrada (devolución)?', {
      title: 'Confirmar devolución',
      confirmText: 'Registrar',
      type: 'success'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/solicitudes/${solicitudSeleccionada.id}/registrar-entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: user.documento,
          observacion
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Entrada registrada exitosamente');
        setSolicitudSeleccionada(null);
        fetchHistorial();
      } else {
        toast.error(data.error || 'Error al registrar entrada');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Historial de Salidas</h1>
        <p className="text-gray-600">Registro de todas las autorizaciones</p>
      </div>

      <TablaSolicitudes
        solicitudes={solicitudesFiltradas}
        loading={loading}
        onVerDetalles={verDetalles}
        mensajeVacio="No hay registros en el historial"
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
        >
          {(solicitudSeleccionada.estado === 'autorizada' || solicitudSeleccionada.estado === 'en_prestamo') && (
            <button
              onClick={registrarEntrada}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Registrar Entrada
            </button>
          )}
        </ModalDetalleSolicitud>
      )}
    </div>
  );
}
