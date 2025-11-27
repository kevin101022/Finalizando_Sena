'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SolicitarBienes() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    motivo: '',
    fecha_inicio: '',
    fecha_fin: '',
    destino: '',
    sede_id: '',
    observaciones: ''
  });

  // Estado para items solicitados
  const [items, setItems] = useState([
    { categoria: 'Tecnología', cantidad: 1, descripcion: '' }
  ]);

  // Validar autenticación
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, [router]);

  // Cargar sedes
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await fetch('/api/edificios'); // Usa el endpoint existente que devuelve sedes
        const data = await response.json();
        if (data.success) {
          setSedes(data.sedes || data.edificios);
        }
      } catch (err) {
        console.error('Error cargando sedes:', err);
      }
    };
    fetchSedes();
  }, []);

  // Manejar cambios en formulario principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en items
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Agregar item
  const addItem = () => {
    setItems([...items, { categoria: 'Tecnología', cantidad: 1, descripcion: '' }]);
  };

  // Eliminar item
  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // Enviar solicitud
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        doc_persona: user.documento, // Usar documento del usuario
        sede_id: formData.sede_id,
        motivo: formData.motivo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        destino: formData.destino,
        observaciones: formData.observaciones,
        detalles: items
      };

      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Solicitud creada exitosamente');
        setTimeout(() => {
          router.push('/dashboard'); // O a una lista de mis solicitudes
        }, 2000);
      } else {
        setError(data.error || 'Error al crear la solicitud');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nueva Solicitud de Bienes</h2>
        <p className="text-gray-600">Complete el formulario para solicitar préstamo de equipos o mobiliario</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        {/* Datos Generales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
            Datos del Préstamo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Préstamo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                placeholder="Ej: Clase de Programación Web"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sede / Ubicación <span className="text-red-500">*</span>
              </label>
              <select
                name="sede_id"
                value={formData.sede_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
              >
                <option value="">Seleccionar Sede</option>
                {sedes.map(sede => (
                  <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino / Lugar Específico
              </label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                placeholder="Ej: Ambiente 204, Auditorio Principal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
              />
            </div>
          </div>
        </div>

        {/* Items Solicitados */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-[#39A900]">
            <h3 className="text-lg font-semibold text-gray-700">Items Solicitados</h3>
            <button
              type="button"
              onClick={addItem}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              + Agregar Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                <div className="w-1/4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                  <select
                    value={item.categoria}
                    onChange={(e) => handleItemChange(index, 'categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Tecnología">Tecnología</option>
                    <option value="Audiovisual">Audiovisual</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Herramienta">Herramienta</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="w-1/6">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descripción / Detalles</label>
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                    placeholder="Ej: Portátiles i5, Sillas plásticas..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-6 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones Adicionales
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900]"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-[#39A900] to-[#007832] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}
