interface ActivityTypeCardProps {
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  selected: boolean;
  onSelect: (type: string) => void;
}

export default function ActivityTypeCard({
  type,
  selected,
  onSelect,
}: ActivityTypeCardProps) {
  const getConfig = (activityType: string) => {
    const configs = {
      system: {
        title: 'Sistema',
        description: 'Eventos automáticos del sistema',
        icon: 'settings',
        bgColor: '#17a2b8',
      },
      user: {
        title: 'Usuario',
        description: 'Actividades de usuarios',
        icon: 'person',
        bgColor: '#28a745',
      },
      security: {
        title: 'Seguridad',
        description: 'Eventos de seguridad y acceso',
        icon: 'security',
        bgColor: '#dc3545',
      },
      maintenance: {
        title: 'Mantenimiento',
        description: 'Actividades de mantenimiento',
        icon: 'build',
        bgColor: '#ffc107',
      },
      admin: {
        title: 'Administración',
        description: 'Gestión administrativa',
        icon: 'admin_panel_settings',
        bgColor: '#6f42c1',
      },
      financial: {
        title: 'Financiero',
        description: 'Actividades financieras',
        icon: 'attach_money',
        bgColor: '#fd7e14',
      },
    };
    return configs[activityType as keyof typeof configs] || configs.system;
  };

  const config = getConfig(type);

  return (
    <div
      className={`activity-type-card ${type} ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(type);
        }
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
    >
      <div
        className='activity-type-icon'
        style={{ backgroundColor: config.bgColor }}
      >
        <i className='material-icons'>{config.icon}</i>
      </div>
      <div className='activity-type-title'>{config.title}</div>
      <div className='activity-type-description'>{config.description}</div>

      <style jsx>{`
        .activity-type-card {
          background: #fff;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .activity-type-card:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
        }

        .activity-type-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }

        .activity-type-card.selected::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          border-radius: 8px;
          z-index: -1;
        }

        .activity-type-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: white;
        }

        .activity-type-title {
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .activity-type-description {
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .activity-type-card {
            padding: 1rem;
          }

          .activity-type-icon {
            width: 48px;
            height: 48px;
          }

          .activity-type-title {
            font-size: 0.9rem;
          }

          .activity-type-description {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

