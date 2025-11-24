'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrarBien() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Centro de Costo
    sede: '',
    direccionRegional: '',
    placa: '',

    // Información Básica
    categoria: '',
    marca: '',
    serial: '',
    modelo: '',

    // Descripción
    descripcion: '',

    // Información Financiera y Temporal
    costo: '',
    vidaUtil: '',
    fechaCompra: '',
    fechaRegistro: new Date().toISOString().split('T')[0],

    // Novedades y Observaciones
    estadoBien: 'disponible',
    observacion: ''
  });

  // Validar autenticación
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      // Corregido: usar 'rol' en lugar de 'role' para coincidir con la BD
      if (parsedUser.rol !== 'almacenista') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  // Generar placa automáticamente cuando cambia la categoría
  useEffect(() => {
    if (formData.categoria) {
      const prefijos = {
        'tecnologia': 'TEC',
        'audiovisual': 'AUD',
        'laboratorio': 'LAB',
        'mobiliario': 'MOB',
        'herramienta': 'HER',
        'vehiculo': 'VEH',
        'otro': 'OTR'
      };

      const prefijo = prefijos[formData.categoria] || 'GEN';
      const año = new Date().getFullYear();
      const consecutivo = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

      setFormData(prev => ({
        ...prev,
        placa: `${prefijo}-${año}-${consecutivo}`
      }));
    }
  }, [formData.categoria]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const requiredFields = [
      'sede', 'direccionRegional', 'categoria', 'marca', 'serial',
      'modelo', 'descripcion', 'costo', 'vidaUtil', 'fechaCompra'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Por favor completa el campo: ${field}`);
        return false;
      }
    }

    if (parseFloat(formData.costo) <= 0) {
      alert('El costo debe ser mayor a 0');
      return false;
    }

    if (parseInt(formData.vidaUtil) <= 0) {
      alert('La vida útil debe ser mayor a 0');
      return false;
    }

    if (new Date(formData.fechaCompra) > new Date()) {
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

    // Simular guardado (por ahora solo frontend)
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);

      // Resetear formulario después de 2 segundos y redirigir
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/dashboard');
      }, 2000);
    }, 1000);
  };

  // Cancelar y volver
  const handleCancel = () => {
    if (confirm('¿Estás seguro de cancelar? Se perderán los datos ingresados.')) {
      router.push('/dashboard');
    }
  };

  // Volver al dashboard sin confirmación
  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SENA - Gestión de Bienes</h1>
              <p className="text-sm opacity-90">Registrar Nuevo Bien</p>
            </div>
            <button
              onClick={handleBack}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3">
            <div>
              <p className="font-semibold">¡Bien registrado exitosamente!</p>
              <p className="text-sm">Redirigiendo al dashboard...</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Nuevo Bien</h2>

          {/* Sección: Centro de Costo */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Centro de Costo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sede / Centro de Formación <span className="text-red-500">*</span>
                </label>
                <select
                  name="sede"
                  value={formData.sede}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar sede</option>
                  <option value="centro_cies">Centro CIES</option>
                  <option value="centro_cedrum">Centro CEDRUM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Regional / Edificio <span className="text-red-500">*</span>
                </label>
                <select
                  name="direccionRegional"
                  value={formData.direccionRegional}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar edificio</option>
                  <option value="edificio_principal">Edificio Principal</option>
                  <option value="edificio_administrativo">Edificio Administrativo</option>
                  <option value="edificio_talleres">Edificio de Talleres</option>
                  <option value="edificio_laboratorios">Edificio de Laboratorios</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa (Generada Automáticamente)
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder="Se generará automáticamente al seleccionar categoría"
                />
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
                  <option value="tecnologia">Tecnología</option>
                  <option value="audiovisual">Audiovisual</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="mobiliario">Mobiliario</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="vehiculo">Vehículo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <select
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                >
                  <option value="">Seleccionar marca</option>
                  <option value="dell">Dell</option>
                  <option value="hp">HP</option>
                  <option value="lenovo">Lenovo</option>
                  <option value="epson">Epson</option>
                  <option value="samsung">Samsung</option>
                  <option value="lg">LG</option>
                  <option value="sony">Sony</option>
                  <option value="generico">Genérico</option>
                  <option value="otra">Otra</option>
                </select>
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
                  placeholder="Ej: SN123456789"
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
                  placeholder="Ej: Latitude 5420"
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

          {/* Sección: Información Financiera y Temporal */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Información Financiera y Temporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo (COP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ej: 2500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vida Útil (años) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="vidaUtil"
                  value={formData.vidaUtil}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Ej: 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaCompra"
                  value={formData.fechaCompra}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  name="fechaRegistro"
                  value={formData.fechaRegistro}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Sección: Novedades y Observaciones */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-[#39A900]">
              Novedades y Observaciones
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Bien <span className="text-red-500">*</span>
                </label>
                <select
                  name="estadoBien"
                  value={formData.estadoBien}
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
                  name="observacion"
                  value={formData.observacion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones adicionales (opcional)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#39A900] to-[#007832] text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>
    </div>
  );
}
