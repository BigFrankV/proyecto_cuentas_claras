interface PriorityOptionProps {
  priority: 'low' | 'normal' | 'high' | 'critical';
  selected: boolean;
  onSelect: (priority: string) => void;
}

export default function PriorityOption({
  priority,
  selected,
  onSelect,
}: PriorityOptionProps) {
  const getConfig = (priorityLevel: string) => {
    const configs = {
      low: {
        title: 'Baja',
        description: 'Información general',
        icon: 'keyboard_arrow_down',
        bgColor: '#28a745',
      },
      normal: {
        title: 'Normal',
        description: 'Actividad estándar',
        icon: 'remove',
        bgColor: '#17a2b8',
      },
      high: {
        title: 'Alta',
        description: 'Requiere atención',
        icon: 'keyboard_arrow_up',
        bgColor: '#ffc107',
      },
      critical: {
        title: 'Crítica',
        description: 'Atención inmediata',
        icon: 'priority_high',
        bgColor: '#dc3545',
      },
    };
    return configs[priorityLevel as keyof typeof configs] || configs.normal;
  };

  const config = getConfig(priority);

  return (
    <div
      className={`priority-option ${priority} ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(priority)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(priority);
        }
      }}
      style={{ cursor: 'pointer' }}
      role='button'
      tabIndex={0}
    >
      <div
        className='priority-icon'
        style={{ backgroundColor: config.bgColor }}
      >
        <i className='material-icons'>{config.icon}</i>
      </div>
      <div className='priority-content'>
        <div className='priority-title'>{config.title}</div>
        <div className='priority-description'>{config.description}</div>
      </div>

      <style jsx>{`
        .priority-option {
          background: #fff;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .priority-option:hover {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }

        .priority-option.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }

        .priority-option.low.selected {
          border-color: #28a745;
          background: rgba(40, 167, 69, 0.1);
        }

        .priority-option.normal.selected {
          border-color: #17a2b8;
          background: rgba(23, 162, 184, 0.1);
        }

        .priority-option.high.selected {
          border-color: #ffc107;
          background: rgba(255, 193, 7, 0.1);
        }

        .priority-option.critical.selected {
          border-color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }

        .priority-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .priority-content {
          flex-grow: 1;
        }

        .priority-title {
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }

        .priority-description {
          font-size: 0.875rem;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .priority-option {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .priority-icon {
            width: 32px;
            height: 32px;
          }

          .priority-title {
            font-size: 0.9rem;
          }

          .priority-description {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
