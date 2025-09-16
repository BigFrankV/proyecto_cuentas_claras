# 🏢 Cuentas Claras - Frontend

Sistema moderno de administración de comunidades desarrollado con Next.js, TypeScript y React. Incluye dashboard interactivo con gráficos, gestión completa de gastos, pagos, medidores y más.

## 🌟 Características Principales

- ✅ **Dashboard Interactivo** con Chart.js y visualizaciones en tiempo real
- 🏘️ **Gestión de Comunidades** - Edificios, torres, unidades y residentes
- 💰 **Control Financiero** - Gastos, cargos, pagos y estados de cuenta
- 📊 **Reportes y Analytics** - Tendencias, estadísticas y análisis
- 🔧 **Medidores y Consumos** - Lecturas de agua, luz y gas
- 👥 **Gestión de Usuarios** - Residentes, proveedores y administradores
- 📱 **Diseño Responsivo** - Optimizado para móviles y tablets
- 🔐 **Autenticación JWT** - Sistema seguro de login y permisos

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5.2+
- **UI Library:** React 18
- **Styling:** Bootstrap 5.3.2 + CSS Custom Properties
- **Charts:** Chart.js 4.4.0 + react-chartjs-2
- **State Management:** React Context + Custom Hooks
- **HTTP Client:** Axios
- **Authentication:** JWT + LocalStorage
- **Testing:** Jest + React Testing Library
- **Code Quality:** ESLint + Prettier + Husky

## 📁 Estructura del Proyecto

```
react/
├── components/           # Componentes reutilizables
│   ├── layout/          # Componentes de layout (Sidebar, Navbar)
│   └── ui/              # Componentes de UI (Cards, Charts, etc.)
├── pages/               # Páginas de Next.js (routing automático)
│   ├── api/            # API Routes de Next.js
│   ├── _app.tsx        # Configuración global de la app
│   ├── _document.tsx   # Configuración del documento HTML
│   ├── dashboard.tsx   # Dashboard principal
│   └── login.tsx       # Página de login
├── public/             # Archivos estáticos
├── styles/             # Archivos CSS
│   ├── globals.css     # Estilos globales
│   └── components.css  # Estilos de componentes
├── lib/                # Utilidades y helpers
├── __tests__/          # Tests unitarios
├── package.json        # Dependencias y scripts
├── next.config.js      # Configuración de Next.js
├── tsconfig.json       # Configuración de TypeScript
├── jest.config.js      # Configuración de Jest
└── README.md          # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm 8.0.0 o superior

### Instalación

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**

   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   ```
   http://localhost:5173
   ```

## 📜 Scripts Disponibles

| Comando                 | Descripción                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Ejecuta la aplicación en modo desarrollo         |
| `npm run build`         | Construye la aplicación para producción          |
| `npm run start`         | Ejecuta la aplicación en modo producción         |
| `npm run lint`          | Ejecuta ESLint para revisar el código            |
| `npm run lint:fix`      | Ejecuta ESLint y corrige errores automáticamente |
| `npm run type-check`    | Verifica los tipos de TypeScript                 |
| `npm run test`          | Ejecuta todos los tests                          |
| `npm run test:watch`    | Ejecuta tests en modo watch                      |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura           |
| `npm run format`        | Formatea el código con Prettier                  |
| `npm run format:check`  | Verifica el formateo del código                  |

## 🏗️ Arquitectura y Patrones

### Componentes

```typescript
// Ejemplo de componente funcional con TypeScript
interface ComponentProps {
  title: string
  children: React.ReactNode
}

export default function Component({ title, children }: ComponentProps) {
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Páginas Next.js

```typescript
// pages/ejemplo.tsx
import Layout from '@/components/layout/Layout'

export default function EjemploPage() {
  return (
    <Layout title="Ejemplo - Cuentas Claras">
      <div className="container-fluid p-4">
        <h1>Mi Página</h1>
      </div>
    </Layout>
  )
}
```

### Routing

Next.js utiliza **file-based routing**:

- `pages/dashboard.tsx` → `/dashboard`
- `pages/usuarios/index.tsx` → `/usuarios`
- `pages/usuarios/[id].tsx` → `/usuarios/123`
- `pages/api/users.ts` → `/api/users`

## 🎨 Sistema de Diseño

### Variables CSS

```css
:root {
  --color-primary: #0d47a1;
  --color-secondary: #1976d2;
  --color-accent: #fd5d14;
  --border-radius: 0.375rem;
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
```

### Componentes Bootstrap + Custom

- **Layout responsive** con sidebar y mobile navbar
- **Cards** con gradientes y animaciones
- **Tablas** con hover effects y estado activo
- **Formularios** con validación visual
- **Botones** con estados y variantes

## 🧪 Testing

### Configuración

- **Jest** como test runner
- **Testing Library** para testing de componentes React
- **jsdom** como entorno de testing

### Ejemplo de Test

```typescript
import { render, screen } from '@testing-library/react'
import Component from '../Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## 📱 Responsive Design

### Breakpoints

- **xs**: < 576px (móviles)
- **sm**: ≥ 576px (móviles grandes)
- **md**: ≥ 768px (tablets)
- **lg**: ≥ 992px (laptops)
- **xl**: ≥ 1200px (desktops)

### Mobile-First

```css
/* Móvil primero */
.component {
  padding: 1rem;
}

/* Tablet y superior */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Crear `.env.local`:

```bash
NEXTAUTH_SECRET=tu-secreto-aqui
NEXTAUTH_URL=http://localhost:5173
API_BASE_URL=http://localhost:8000/api
```

### Configuración de TypeScript

El proyecto incluye configuración estricta de TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## 🚀 Deployment

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

### Build para Producción

```bash
npm run build
npm run start
```

## 📚 Recursos y Documentación

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

### Migrando desde HTML

Para migrar las páginas HTML existentes:

1. **Copiar el contenido** de la página HTML
2. **Convertir a JSX** (className, onClick, etc.)
3. **Extraer componentes** reutilizables
4. **Añadir TypeScript types**
5. **Implementar tests**

### Agregando Nueva Página

```typescript
// pages/nueva-pagina.tsx
import Layout from '@/components/layout/Layout'

export default function NuevaPagina() {
  return (
    <Layout title="Nueva Página - Cuentas Claras">
      {/* Tu contenido aquí */}
    </Layout>
  )
}
```

### Performance Tips

- Usar `next/image` para imágenes optimizadas
- Implementar `getStaticProps` para contenido estático
- Usar `dynamic imports` para componentes pesados
- Implementar `React.memo` para componentes que no cambian

---

**Versión:** 1.0.0  
**Última actualización:** Septiembre 2025  
**Mantenedor:** Equipo Cuentas Claras
