export default function RecentActivity() {
  const activities = [
    {
      icon: 'receipt_long',
      title: 'Nueva emisión generada',
      description: 'Emisión #2025-001 para Torres del Sol',
      time: 'Hace 5 minutos',
      color: 'primary',
    },
    {
      icon: 'payments',
      title: 'Pago recibido',
      description: 'Pago de $350.000 - Unidad 402',
      time: 'Hace 15 minutos',
      color: 'success',
    },
    {
      icon: 'person_add',
      title: 'Nuevo residente',
      description: 'María González registrada en unidad 205',
      time: 'Hace 1 hora',
      color: 'info',
    },
    {
      icon: 'build',
      title: 'Mantenimiento programado',
      description: 'Ascensor Torre A - Mañana 9:00 AM',
      time: 'Hace 2 horas',
      color: 'warning',
    },
    {
      icon: 'event_available',
      title: 'Reserva de amenidad',
      description: 'Quincho familiar - Sábado 18:00',
      time: 'Hace 3 horas',
      color: 'secondary',
    },
  ];

  return (
    <div className='row'>
      <div className='col-12'>
        <div className='card'>
          <div className='card-header bg-light'>
            <h5 className='card-title mb-0'>
              <i className='material-icons me-2'>history</i>
              Actividad Reciente
            </h5>
          </div>
          <div className='card-body p-0'>
            <div className='list-group list-group-flush'>
              {activities.map((activity, index) => (
                <div key={index} className='list-group-item border-0 py-3'>
                  <div className='d-flex align-items-start'>
                    <div
                      className={
                        'rounded-circle d-flex align-items-center justify-content-center me-3'
                      }
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: `var(--color-${activity.color})`,
                        color: 'white',
                      }}
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '1.2rem' }}
                      >
                        {activity.icon}
                      </i>
                    </div>
                    <div className='flex-grow-1'>
                      <h6 className='mb-1'>{activity.title}</h6>
                      <p className='mb-1 text-muted'>{activity.description}</p>
                      <small className='text-muted'>{activity.time}</small>
                    </div>
                    <div className='ms-auto'>
                      <button className='btn btn-sm btn-outline-secondary'>
                        <i className='material-icons'>more_horiz</i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='card-footer bg-light text-center'>
            <button className='btn btn-link text-decoration-none'>
              Ver toda la actividad
              <i className='material-icons ms-1'>arrow_forward</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
