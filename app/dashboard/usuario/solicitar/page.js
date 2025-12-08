'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageIcon, PlusIcon, TrashIcon, CalendarIcon } from '@/app/components/Icons';
import { useToast } from '@/app/components/Toast';
import { useConfirm } from '@/app/components/ConfirmDialog';

export default function SolicitarBienes() {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bienes, setBienes] = useState([]);
  const [bienesFiltrados, setBienesFiltrados] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCuentadante, setFiltroCuentadante] = useState('');
  const [searchAmbiente, setSearchAmbiente] = useState('');
  
  const [formData, setFormData] = useState({
    sede_id: '',
    fecha_ini_prestamo: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    fecha_fin_prestamo: '',
    destino: '',
    motivo: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  // Cargar bienes disponibles, sedes y ambientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resBienes = await fetch('/api/bienes/disponibles');
        const dataBienes = await resBienes.json();
        if (dataBienes.success) {
          setBienes(dataBienes.bienes);
          setBienesFiltrados(dataBienes.bienes);
        }

        const resSedes = await fetch('/api/sedes');
        const dataSedes = await resSedes.json();
        if (dataSedes.success) setSedes(dataSedes.sedes);

        const resAmbientes = await fetch('/api/ambientes');
        const dataAmbientes = await resAmbientes.json();
        if (dataAmbientes.success) setAmbientes(dataAmbientes.ambientes);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Filtrar bienes
  useEffect(() => {
    let filtered = bienes;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cuentadante_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ambiente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroCuentadante) {
      filtered = filtered.filter(b => b.cuentadante_documento === filtroCuentadante);
    }

    setBienesFiltrados(filtered);
  }, [searchTerm, filtroCuentadante, bienes]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const agregarAlCarrito = (bien) => {
    if (carrito.find(b => b.asignacion_id === bien.asignacion_id)) {
      toast.warning('Este bien ya está en tu carrito');
      return;
    }
    setCarrito(prev => [...prev, bien]);
    toast.success(`${bien.placa} agregado al carrito`);
  };

  const eliminarDelCarrito = (asignacionId) => {
    setCarrito(prev => prev.filter(b => b.asignacion_id !== asignacionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (carrito.length === 0) {
      toast.warning('Debes agregar al menos un bien al carrito');
      return;
    }

    if (!formData.sede_id || !formData.fecha_ini_prestamo || !formData.fecha_fin_prestamo || !formData.destino || !formData.motivo) {
      toast.warning('Por favor completa todos los campos');
      return;
    }

    const confirmed = await confirm(`¿Enviar solicitud con ${carrito.length} bien(es)?`, {
      title: 'Confirmar envío',
      confirmText: 'Enviar',
      type: 'info'
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doc_persona: user.documento,
          bienes: carrito.map(b => b.asignacion_id)
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`${data.solicitudesCreadas} solicitud(es) creada(s) exitosamente`);
        router.push('/dashboard/usuario/solicitudes');
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  // Obtener lista única de cuentadantes
  const cuentadantes = [...new Map(bienes.map(b => [b.cuentadante_documento, {
    documento: b.cuentadante_documento,
    nombre: b.cuentadante_nombre
  }])).values()];

  // Agrupar carrito por cuentadante
  const carritoAgrupado = carrito.reduce((acc, bien) => {
    const key = bien.cuentadante_documento;
    if (!acc[key]) {
      acc[key] = {
        cuentadante: bien.cuentadante_nombre,
        bienes: []
      };
    }
    acc[key].bienes.push(bien);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitar Bienes en Préstamo</h1>
        <p className="text-gray-600">Selecciona los bienes que necesitas y completa la información</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda: Bienes Disponibles y Carrito */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bienes Disponibles */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bienes Disponibles</h2>
              
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por placa, descripción, ambiente..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                />
                <select
                  value={filtroCuentadante}
                  onChange={(e) => setFiltroCuentadante(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                >
                  <option value="">Todos los cuentadantes</option>
                  {cuentadantes.map(c => (
                    <option key={c.documento} value={c.documento}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuentadante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ambiente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bienesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No hay bienes disponibles
                      </td>
                    </tr>
                  ) : (
                    bienesFiltrados.map(bien => (
                      <tr key={bien.asignacion_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{bien.placa}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{bien.descripcion || 'Sin descripción'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{bien.cuentadante_nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{bien.ambiente_nombre}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => agregarAlCarrito(bien)}
                            disabled={carrito.find(b => b.asignacion_id === bien.asignacion_id)}
                            className="p-2 bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Agregar"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bienes Seleccionados (Carrito) */}
          <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#39A900]">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PackageIcon className="w-5 h-5 text-[#39A900]" />
                  Bienes Seleccionados
                </h2>
                <span className="px-3 py-1 bg-[#39A900] text-white text-sm font-semibold rounded-full">
                  {carrito.length}
                </span>
              </div>
              {carrito.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {Object.keys(carritoAgrupado).length} solicitud(es) • {carrito.length} bien(es)
                </p>
              )}
            </div>

            {carrito.length === 0 ? (
              <div className="p-8">
                <div className="text-center">
                  <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No has seleccionado bienes aún</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega bienes desde la tabla superior</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {Object.entries(carritoAgrupado).map(([doc, grupo]) => (
                  <div key={doc} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-[#39A900] flex items-center gap-1">
                        <span>👤</span>
                        <span className="truncate">{grupo.cuentadante}</span>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-[10px]">
                          {grupo.bienes.length}
                        </span>
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {grupo.bienes.map(bien => (
                        <div key={bien.asignacion_id} className="flex items-center gap-2 p-2 hover:bg-gray-50 transition">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{bien.placa}</p>
                            <p className="text-[10px] text-gray-500 truncate">{bien.descripcion}</p>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(bien.asignacion_id)}
                            className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Columna derecha: Formulario */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Formulario - Sticky */}
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#39A900]" />
              Información del Préstamo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede de Destino *</label>
                <select
                  name="sede_id"
                  value={formData.sede_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente de Destino *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.destino || searchAmbiente}
                    onChange={(e) => {
                      setSearchAmbiente(e.target.value);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, destino: '' }));
                      }
                    }}
                    onFocus={() => {
                      if (formData.destino) {
                        setSearchAmbiente(formData.destino);
                        setFormData(prev => ({ ...prev, destino: '' }));
                      }
                    }}
                    placeholder="Buscar y seleccionar ambiente..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                  />
                  {searchAmbiente && !formData.destino && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {ambientes
                        .filter(a => 
                          a.nombre.toLowerCase().includes(searchAmbiente.toLowerCase()) ||
                          a.sede_nombre.toLowerCase().includes(searchAmbiente.toLowerCase())
                        )
                        .map(ambiente => (
                          <button
                            key={ambiente.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, destino: ambiente.nombre }));
                              setSearchAmbiente('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                          >
                            <p className="text-sm font-medium text-gray-900">{ambiente.nombre}</p>
                            <p className="text-xs text-gray-500">{ambiente.sede_nombre}</p>
                          </button>
                        ))
                      }
                    </div>
                  )}
                  {formData.destino && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, destino: '' }));
                        setSearchAmbiente('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition"
                      title="Limpiar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Salida *</label>
                  <input
                    type="date"
                    name="fecha_ini_prestamo"
                    value={formData.fecha_ini_prestamo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    readOnly
                    title="Fecha actual del sistema"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fecha actual del sistema</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Devolución *</label>
                  <input
                    type="date"
                    name="fecha_fin_prestamo"
                    value={formData.fecha_fin_prestamo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
                    min={formData.fecha_ini_prestamo}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Debe ser posterior a la fecha de salida</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Describe para qué necesitas los bienes..."
                  required
                ></textarea>
              </div>

              {/* Botón de envío */}
              {carrito.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-3 p-2 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <span>Se crearán {Object.keys(carritoAgrupado).length} solicitud(es) separadas</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-[#39A900] text-white rounded-lg font-semibold hover:bg-[#007832] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
        
      </div>
    </div>
  );
}
