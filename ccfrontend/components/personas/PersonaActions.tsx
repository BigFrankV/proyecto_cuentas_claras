interface PersonaActionsProps {
  className?: string;
}

export default function PersonaActions({
  className = '',
}: PersonaActionsProps) {
  const actions = [
    {
      icon: 'email',
      text: 'Enviar email',
      action: () => console.log('Enviar email'),
    },
    {
      icon: 'receipt_long',
      text: 'Ver estado de cuenta',
      action: () => console.log('Ver estado de cuenta'),
    },
    {
      icon: 'add_home',
      text: 'Asignar nueva unidad',
      action: () => console.log('Asignar nueva unidad'),
    },
    {
      icon: 'vpn_key',
      text: 'Restablecer contraseña',
      action: () => console.log('Restablecer contraseña'),
    },
  ];

  return (
    <div className={`card shadow-sm ${className}`}>
      <div className='card-header bg-transparent'>
        <h6 className='mb-0'>Acciones Rápidas</h6>
      </div>
      <div className='card-body'>
        <div className='d-grid gap-2'>
          {actions.map((action, index) => (
            <button
              key={index}
              className='btn btn-outline-primary text-start'
              onClick={action.action}
            >
              <i className='material-icons me-2'>{action.icon}</i>
              {action.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
