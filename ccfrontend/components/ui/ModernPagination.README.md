# Componente ModernPagination

## Descripción
El componente `ModernPagination` es un componente reutilizable para la paginación de listas y tablas en la aplicación. Proporciona una interfaz moderna y consistente para navegar entre páginas de datos.

## Props

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currentPage` | `number` | Sí | Página actual seleccionada |
| `totalPages` | `number` | Sí | Número total de páginas disponibles |
| `totalItems` | `number` | Sí | Número total de elementos en la lista |
| `itemsPerPage` | `number` | Sí | Número de elementos por página |
| `itemName` | `string` | Sí | Nombre del tipo de elemento (ej: "edificios", "personas") |
| `onPageChange` | `(page: number) => void` | Sí | Función callback que se ejecuta al cambiar de página |

## Ejemplo de Uso

```tsx
import ModernPagination from '@/components/ui/ModernPagination';

// En tu componente
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// Función para cambiar de página
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

// Calcular paginación
const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

// Renderizar el componente
{totalPages > 1 && (
  <ModernPagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={filteredItems.length}
    itemsPerPage={itemsPerPage}
    itemName="edificios"
    onPageChange={goToPage}
  />
)}
```

## Implementación en Páginas Existentes

### Edificios (`pages/edificios.tsx`)
```tsx
// Ya implementado - ejemplo de referencia
<ModernPagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredEdificios.length}
  itemsPerPage={itemsPerPage}
  itemName="edificios"
  onPageChange={goToPage}
/>
```

### Unidades (`pages/unidades.tsx`)
```tsx
// Ejemplo de implementación pendiente
<ModernPagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredUnidades.length}
  itemsPerPage={itemsPerPage}
  itemName="unidades"
  onPageChange={goToPage}
/>
```

### Personas (`pages/personas.tsx`)
```tsx
// Ejemplo de implementación pendiente
<ModernPagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredPersonas.length}
  itemsPerPage={itemsPerPage}
  itemName="personas"
  onPageChange={goToPage}
/>
```

## Estilos
El componente incluye estilos CSS integrados que proporcionan:
- Diseño moderno con gradientes
- Botones de navegación con iconos Material Icons
- Información clara de página actual y total
- Estados deshabilitados para navegación
- Diseño responsivo

## Migración desde Paginación Manual

### Antes (Código Antiguo)
```tsx
{/* Paginación moderna */}
{totalPages > 1 && (
  <nav aria-label='Navegación de páginas' className='pagination-modern'>
    <button
      className='btn'
      onClick={goToPreviousPage}
      disabled={currentPage === 1}
      aria-label='Página anterior'
    >
      <span className='material-icons'>chevron_left</span>
    </button>

    <div className='page-info'>
      Página {currentPage} de {totalPages} ({filteredItems.length} unidades)
    </div>

    <button
      className='btn'
      onClick={goToNextPage}
      disabled={currentPage === totalPages}
      aria-label='Página siguiente'
    >
      <span className='material-icons'>chevron_right</span>
    </button>
  </nav>
)}
```

### Después (Componente ModernPagination)
```tsx
import ModernPagination from '@/components/ui/ModernPagination';

// Agregar el import al inicio del archivo
// ...

{/* Paginación moderna */}
{totalPages > 1 && (
  <ModernPagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={filteredItems.length}
    itemsPerPage={itemsPerPage}
    itemName="unidades"
    onPageChange={goToPage}
  />
)}
```

### Funciones Necesarias
Asegúrate de tener estas funciones en tu componente:

```tsx
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

// Si no tienes estas funciones, puedes eliminarlas ya que el componente las maneja internamente
// const goToPreviousPage = () => goToPage(currentPage - 1);
// const goToNextPage = () => goToPage(currentPage + 1);
```