'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreatableSelect from 'react-select/creatable';

export default function RegistrarBien() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [edificios, setEdificios] = useState([]);
  const [centros, setCentros] = useState([]);
  const [marcas, setMarcas] = useState([]); // Estado para marcas
  const [isLoadingMarcas, setIsLoadingMarcas] = useState(false); // Loading para marcas
  const [error, setError] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    marca: '', // Texto para compatibilidad/visualización
    marca_id: null, // ID de la marca seleccionada
    serial: '',
    modelo: '',
    descripcion: '',
    valor_compra: '',
    fecha_compra: '',
    estado: 'disponible',
    observaciones: '',
    edificio_id: '',
    centro_formacion_id: ''
  });

  // Validar autenticación
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.rol !== 'almacenista') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  // Cargar edificios, centros y MARCAS desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar edificios y centros
        const responseEdificios = await fetch('/api/edificios');
        const dataEdificios = await responseEdificios.json();
        
        if (dataEdificios.success) {
          setEdificios(dataEdificios.edificios);
          setCentros(dataEdificios.centros);
        }

        // Cargar marcas
        setIsLoadingMarcas(true);
        const responseMarcas = await fetch('/api/marcas');
        const dataMarcas = await responseMarcas.json();

        if (dataMarcas.success) {
          // Formatear para react-select
          const marcasOptions = dataMarcas.marcas.map(m => ({
            value: m.id,
            label: m.nombre
          }));
          setMarcas(marcasOptions);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error de conexión al cargar datos auxiliares');
      } finally {
        setIsLoadingMarcas(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Generar código automáticamente
  useEffect(() => {
    if (formData.categoria) {
      const prefijos = {
        'Tecnología': 'TEC',
        'Audiovisual': 'AUD',
        'Laboratorio': 'LAB',
        'Mobiliario': 'MOB',
        'Herramienta': 'HER',
        'Vehículo': 'VEH',
        'Otro': 'OTR'
      };

      const prefijo = prefijos[formData.categoria] || 'GEN';
      const año = new Date().getFullYear();
      const consecutivo = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

      setFormData(prev => ({
        ...prev,
        codigo: `${prefijo}-${año}-${consecutivo}`
      }));
    }
  }, [formData.categoria]);

  // Manejar cambios en inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio en Select de Marca
  const handleMarcaChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      marca: newValue ? newValue.label : '',
      marca_id: newValue ? newValue.value : null
    }));
  };

  // Manejar creación de nueva marca
  const handleCreateMarca = async (inputValue) => {
    setIsLoadingMarcas(true);
    try {
      const response = await fetch('/api/marcas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: inputValue })
      });
      
      const data = await response.json();

      if (data.success) {
        const newOption = { value: data.marca.id, label: data.marca.nombre };
        setMarcas(prev => [...prev, newOption]);
        
        // Seleccionar la nueva marca automáticamente
        setFormData(prev => ({
          ...prev,
          marca: newOption.label,
          marca_id: newOption.value
        }));
      } else {
        alert('Error al crear la marca: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      console.error('Error creando marca:', err);
      alert('Error de conexión al crear la marca');
    } finally {
      setIsLoadingMarcas(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const requiredFields = [
      'codigo', 'nombre', 'categoria', 'marca', 'serial',
      'modelo', 'descripcion', 'valor_compra', 'fecha_compra',
      'edificio_id', 'centro_formacion_id'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Por favor completa el campo: ${field}`);
        return false;
      }
    }

    if (parseFloat(formData.valor_compra) <= 0) {
      alert('El valor de compra debe ser mayor a 0');
      return false;
    }

    if (new Date(formData.fecha_compra) > new Date()) {
      alert('La fecha de compra no puede ser futura');
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bienes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/almacenista/inventario');
        }, 2000);
      } else {
        setError(data.error || 'Error al registrar el bien');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al registrar bien:', err);
      setError('Error de conexión al registrar el bien');
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

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Bien</h2>
        <p className="text-gray-600">Complete el formulario para registrar un nuevo activo</p>
      </div>
        
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3">
            <div>
              <p className="font-semibold">¡Bien registrado exitosamente!</p>
              <p className="text-sm">Redirigiendo al inventario...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Nuevo Bien</h2>

          {/* Sección: Identificación */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código/Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Se genera automáticamente"
                />
                <p className="text-xs text-gray-500 mt-1">Generado automáticamente según categoría</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Bien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                  placeholder="ej: Laptop Dell Latitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centro de Formación <span className="text-red-500">*</span>
                </label>
                <select
                  name="centro_formacion_id"
                  value={formData.centro_formacion_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar centro</option>
                  {centros.map(centro => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edificio <span className="text-red-500">*</span>
                </label>
                <select
                  name="edificio_id"
                  value={formData.edificio_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar edificio</option>
                  {edificios.map(edificio => (
                    <option key={edificio.id} value={edificio.id}>
                      {edificio.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Información Básica */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Audiovisual">Audiovisual</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Mobiliario">Mobiliario</option>
                  <option value="Herramienta">Herramienta</option>
                  <option value="Vehículo">Vehículo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <CreatableSelect
                  isClearable
                  isDisabled={isLoadingMarcas}
                  isLoading={isLoadingMarcas}
                  onChange={handleMarcaChange}
                  onCreateOption={handleCreateMarca}
                  options={marcas}
                  value={formData.marca_id ? { label: formData.marca, value: formData.marca_id } : null}
                  placeholder="Seleccionar o escribir nueva..."
                  formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#D1D5DB',
                      borderRadius: '0.5rem',
                      padding: '2px',
                      '&:hover': {
                        borderColor: '#39A900'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#39A900' : state.isFocused ? '#E8F5E9' : 'white',
                      color: state.isSelected ? 'white' : 'black',
                    })
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Escribe para buscar o crear una nueva</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  required
                  placeholder="ej: SN123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                  placeholder="ej: Latitude 5420"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección: Descripción */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Descripción
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Bien <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe las características principales del bien..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
              />
            </div>
          </div>

          {/* Sección: Información Financiera */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Información Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor de Compra (COP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="valor_compra"
                  value={formData.valor_compra}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="ej: 2500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_compra"
                  value={formData.fecha_compra}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección: Estado y Observaciones */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Estado y Observaciones
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Bien <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="en_reparacion">En Reparación</option>
                  <option value="dado_de_baja">Dado de Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones adicionales (opcional)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#39A900] to-[#007832] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Registrando...
                </span>
              ) : (
                'Registrar Bien'
              )}
            </button>
          </div>
        </form>
    </div>
  );
}
