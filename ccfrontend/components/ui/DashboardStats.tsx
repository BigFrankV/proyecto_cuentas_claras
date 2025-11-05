export default function DashboardStats() {
  const stats = [
    {
      icon: 'domain',
      number: '12',
      label: 'Comunidades',
      detail: '↗ 8% este mes',
      color: 'primary',
    },
    {
      icon: 'people',
      number: '1,247',
      label: 'Residentes',
      detail: '↗ 12% este mes',
      color: 'success',
    },
    {
      icon: 'receipt_long',
      number: '45',
      label: 'Emisiones Pendientes',
      detail: '↘ 3% esta semana',
      color: 'warning',
    },
    {
      icon: 'payments',
      number: '$2.3M',
      label: 'Recaudación Mensual',
      detail: '↗ 15% este mes',
      color: 'info',
    },
  ];

  return (
    <div className='row mb-4'>
      {stats.map((stat, index) => (
        <div key={index} className='col-lg-3 col-md-6 mb-3'>
          <div className='stats-card'>
            <div className={`stats-icon ${stat.color}`}>
              <i className='material-icons'>{stat.icon}</i>
            </div>
            <div className='stats-number'>{stat.number}</div>
            <div className='stats-label'>{stat.label}</div>
            <div className='stats-detail'>{stat.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
