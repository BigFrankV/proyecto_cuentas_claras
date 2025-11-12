// Ejemplos de uso del componente PageHeader en otras páginas

/*
Para páginas con estadísticas (como Unidades, Personas, etc.):

<PageHeader
  title="Personas"
  subtitle="Gestión de residentes y propietarios"
  icon="people"
  primaryAction={{
    href: '/personas/nueva',
    label: 'Nueva Persona',
    icon: 'person_add'
  }}
  stats={[
    {
      icon: 'group',
      value: stats.total,
      label: 'Total Personas',
      color: 'var(--color-primary)'
    },
    {
      icon: 'verified_user',
      value: stats.propietarios,
      label: 'Propietarios',
      color: 'var(--color-success)'
    },
    {
      icon: 'person',
      value: stats.residentes,
      label: 'Residentes',
      color: 'var(--color-info)'
    },
    {
      icon: 'pending',
      value: stats.pendientes,
      label: 'Pendientes',
      color: 'var(--color-warning)'
    }
  ]}
/>

Para páginas sin estadísticas (como formularios, detalles, etc.):

<PageHeader
  title="Nueva Unidad"
  subtitle="Registrar una nueva unidad en el sistema"
  icon="add_home"
/>

Para páginas con gradiente diferente:

<PageHeader
  title="Dashboard Financiero"
  subtitle="Resumen completo de finanzas"
  icon="account_balance"
  gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  stats={[...estadisticas]}
/>

Para páginas sin acción primaria:

<PageHeader
  title="Configuración del Sistema"
  subtitle="Administrar parámetros globales"
  icon="settings"
  stats={[...configStats]}
/>
*/