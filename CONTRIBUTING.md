# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión de Bienes del SENA!

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

- **Título descriptivo**
- **Pasos para reproducir** el problema
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** si es aplicable
- **Información del entorno** (navegador, versión de Node.js, etc.)

### Sugerir Mejoras

Para sugerir nuevas características:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue describiendo:
   - La funcionalidad propuesta
   - Por qué sería útil
   - Posible implementación

### Contribuir con Código

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. **Realiza tus cambios** siguiendo los estándares de código
4. **Commit** tus cambios con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar filtro de búsqueda en inventario"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-descriptivo
   ```
6. **Abre un Pull Request** con descripción detallada

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- Git

### Instalación

```bash
# Clona tu fork
git clone https://github.com/tu-usuario/sgb-sena.git
cd sgb-sena

# Instala dependencias
npm install

# Configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# Configura la base de datos
npm run setup-db

# Inicia el servidor de desarrollo
npm run dev
```

## 📝 Estándares de Código

### Estructura de Archivos

```
app/
├── api/              # Endpoints de API
├── components/       # Componentes reutilizables
├── dashboard/        # Páginas por rol
└── [rol]/           # Páginas específicas de rol
```

### Convenciones de Nombres

- **Componentes**: PascalCase (`ModalDetalleSolicitud.js`)
- **Utilidades**: camelCase (`solicitudUtils.js`)
- **Páginas**: kebab-case en carpetas (`historial-asignaciones/`)

### Estilo de Código

- **Indentación**: 2 espacios
- **Comillas**: Simples para strings
- **Punto y coma**: Opcional pero consistente
- **Imports**: Ordenados (React, Next.js, componentes, utilidades)

### Componentes React

```javascript
'use client'; // Si usa hooks o estado

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MiComponente() {
  // Estados
  const [data, setData] = useState([]);
  
  // Efectos
  useEffect(() => {
    // Lógica
  }, []);
  
  // Funciones
  const handleAction = () => {
    // Lógica
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Routes

```javascript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Lógica
    const result = await query('SELECT * FROM tabla');
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
```

### Estilos con TailwindCSS

- Usa clases de utilidad de Tailwind
- Mantén consistencia con los colores del proyecto:
  - Verde principal: `#39A900`
  - Verde secundario: `#007832`
- Usa componentes reutilizables para elementos comunes

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

Ejemplos:
```bash
feat: agregar filtro de búsqueda en tabla de solicitudes
fix: corregir error en cálculo de firmas completadas
docs: actualizar README con instrucciones de instalación
```

## 🔍 Proceso de Pull Request

### Antes de Enviar

- [ ] El código sigue los estándares del proyecto
- [ ] Los cambios están probados localmente
- [ ] No hay errores de lint: `npm run lint`
- [ ] La documentación está actualizada si es necesario
- [ ] Los commits tienen mensajes descriptivos

### Descripción del PR

Incluye en tu Pull Request:

1. **Descripción clara** de los cambios
2. **Tipo de cambio**: Bug fix, nueva feature, refactor, etc.
3. **Screenshots** si hay cambios visuales
4. **Issues relacionados**: Menciona con `#numero`

### Revisión

- El código será revisado por los mantenedores
- Puede haber comentarios o solicitudes de cambios
- Una vez aprobado, será merged a `main`

## 🎨 Diseño y UX

### Principios de Diseño

- **Consistencia**: Usa componentes y estilos existentes
- **Accesibilidad**: Considera usuarios con diferentes capacidades
- **Responsive**: Prueba en diferentes tamaños de pantalla
- **Performance**: Optimiza imágenes y código

### Componentes Reutilizables

Antes de crear un nuevo componente, verifica si existe uno similar:

- `TablaSolicitudes` - Tabla de solicitudes con filtros
- `ModalDetalleSolicitud` - Modal de detalles
- `Toast` - Notificaciones
- `ConfirmDialog` - Diálogos de confirmación

## 📞 Contacto

Si tienes preguntas, puedes:

- Abrir un issue en GitHub
- Contactar al mantenedor del proyecto

---

¡Gracias por contribuir al Sistema de Gestión de Bienes del SENA! 🎉
