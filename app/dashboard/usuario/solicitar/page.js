'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageIcon, PlusIcon, TrashIcon, CalendarIcon, UserIcon } from '@/app/components/Icons';

export default function NuevaSolicitud() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [cuentadantes, setCuentadantes] = useState([]);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');
  const [edificios, setEdificios] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  const [formData, setFormData] = useState({
    sede_destino_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    observaciones: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEdificios = await fetch('/api/edificios');
        const dataEdificios = await resEdificios.json();
        if (dataEdificios.success) setEdificios(dataEdificios.edificios);

        const resCuentadantes = await fetch('/api/cuentadantes');
        const dataCuentadantes = await resCuentadantes.json();
        if (dataCuentadantes.success) setCuentadantes(dataCuentadantes.cuentadantes);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const fetchCatalogo = async () => {
      if (!responsableSeleccionado) {
        setCatalogo([]);
        return;
      }
      try {
        const res = await fetch(`/api/bienes/catalogo?responsable_id=${responsableSeleccionado}`);
        const data = await res.json();
        if (data.success) setCatalogo(data.catalogo);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchCatalogo();
  }, [responsableSeleccionado]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const agregarAlCarrito = (item) => {
    if (carrito.find(i => i.nombre === item.nombre && i.modelo === item.modelo)) {
      alert('Este ítem ya está en tu lista.');
      return;
    }

    const cantidadSolicitada = prompt(`¿Cuántos ${item.nombre} necesitas? (Disponibles: ${item.cantidad_disponible})`, "1");
    if (!cantidadSolicitada) return;

    const cantidad = parseInt(cantidadSolicitada);
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > item.cantidad_disponible) {
      alert('Cantidad inválida');
      return;
    }

    const descripcionExtra = prompt("¿Alguna especificación?", item.descripcion_ejemplo || "");

    setCarrito(prev => [...prev, {
      categoria: item.categoria,
      nombre: item.nombre,
      modelo: item.modelo,
      cantidad,
      descripcion: `${item.nombre} ${item.modelo} - ${descripcionExtra || ''}`,
      responsable_id: item.responsable_id
    }]);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      alert('Debes agregar al menos un bien.');
      return;
    }

    if (!confirm('¿Enviar solicitud?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, ...formData, detalles: carrito })
      });

      const data = await res.json();
      if (data.success) {
        alert('¡Solicitud creada!');
        router.push('/dashboard/');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const responsableInfo = cuentadantes.find(c => c.id === parseInt(responsableSeleccionado));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Nueva Solicitud de Bienes</h1>
        <p className="text-gray-600">Selecciona el cuentadante y los bienes que necesitas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#39A900]" />
              Datos del Préstamo
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede de Destino</label>
                <select
                  name="sede_destino_id"
                  value={formData.sede_destino_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                  required
                >
                  <option value="">Seleccionar sede...</option>
                  {edificios.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min={formData.fecha_inicio}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="¿Para qué actividad?"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#39A900]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-[#39A900]" />
              Resumen del Pedido
            </h2>

            {carrito.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4">
                No has seleccionado bienes aún.
              </p>
            ) : (
              <ul className="space-y-3 mb-6">
                {carrito.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.cantidad}x {item.nombre}</p>
                      <p className="text-xs text-gray-500">{item.descripcion}</p>
                    </div>
                    <button onClick={() => eliminarDelCarrito(idx)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || carrito.length === 0 || !formData.sede_destino_id || !formData.fecha_inicio}
              className="w-full py-3 bg-[#39A900] text-white rounded-lg font-semibold hover:bg-[#007832] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>

        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Catálogo de Bienes Disponibles</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  1. Selecciona el cuentadante responsable
                </label>
                <select
                  value={responsableSeleccionado}
                  onChange={(e) => {
                    if (carrito.length > 0) {
                      if (!confirm('Cambiar de responsable vaciará tu carrito. ¿Continuar?')) return;
                      setCarrito([]);
                    }
                    setResponsableSeleccionado(e.target.value);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] mb-2"
                >
                  <option value="">Seleccionar cuentadante...</option>
                  {cuentadantes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.bienes_disponibles} bienes)</option>
                  ))}
                </select>
                {responsableInfo && (
                  <p className="text-xs text-gray-600">📧 {responsableInfo.email}</p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Bien / Modelo</th>
                    <th className="px-6 py-4 text-center">Disponibles</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!responsableSeleccionado ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        Selecciona un cuentadante para ver su catálogo
                      </td>
                    </tr>
                  ) : catalogo.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        No hay bienes disponibles
                      </td>
                    </tr>
                  ) : (
                    catalogo.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-xs text-gray-500">{item.marca} - {item.modelo} | {item.categoria}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-[#39A900]">
                          {item.cantidad_disponible}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => agregarAlCarrito(item)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Agregar"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
