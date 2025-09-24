import React from 'react';

export interface TimelineItem {
  id: string;
  type: 'created' | 'updated' | 'comment' | 'status_change' | 'assigned' | 'attachment' | 'custom';
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  details?: any;
  icon?: string;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showTime?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  items, 
  className = '',
  showTime = true 
}) => {
  const getTimelineIcon = (type: string, customIcon?: string) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'created':
        return 'add_circle';
      case 'assigned':
        return 'assignment_ind';
      case 'status_change':
        return 'swap_horiz';
      case 'comment':
        return 'comment';
      case 'attachment':
        return 'attach_file';
      case 'updated':
        return 'edit';
      default:
        return 'circle';
    }
  };

  const getTimelineColor = (type: string, customColor?: string) => {
    if (customColor) return customColor;
    
    switch (type) {
      case 'created':
        return '#28a745';
      case 'assigned':
        return '#007bff';
      case 'status_change':
        return '#ffc107';
      case 'comment':
        return '#17a2b8';
      case 'attachment':
        return '#6f42c1';
      case 'updated':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'hace unos momentos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className={`timeline-empty text-center py-4 ${className}`}>
        <i className='material-icons text-muted mb-2' style={{ fontSize: '48px' }}>
          timeline
        </i>
        <p className='text-muted mb-0'>No hay actividades registradas</p>
      </div>
    );
  }

  return (
    <div className={`timeline ${className}`}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className='timeline-item d-flex' 
          style={{
            paddingBottom: index === items.length - 1 ? '0' : '1.5rem',
            position: 'relative'
          }}
        >
          {/* Timeline Line */}
          {index !== items.length - 1 && (
            <div
              className='timeline-line'
              style={{
                position: 'absolute',
                left: '20px',
                top: '40px',
                bottom: '-1.5rem',
                width: '2px',
                backgroundColor: '#e9ecef',
                zIndex: 0
              }}
            />
          )}
          
          {/* Timeline Icon */}
          <div
            className='timeline-icon me-3'
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: getTimelineColor(item.type, item.color),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 1,
              flexShrink: 0,
              border: '3px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <i className='material-icons'>
              {getTimelineIcon(item.type, item.icon)}
            </i>
          </div>
          
          {/* Timeline Content */}
          <div className='timeline-content flex-grow-1'>
            <div className='timeline-header d-flex justify-content-between align-items-start mb-1'>
              <div>
                <h6 className='timeline-title mb-0' style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  {item.content}
                </h6>
                <p className='timeline-user text-muted mb-0' style={{ fontSize: '0.75rem' }}>
                  por {item.user.name}
                </p>
              </div>
              {showTime && (
                <small className='timeline-time text-muted' style={{ fontSize: '0.75rem' }}>
                  {formatDate(item.timestamp)}
                </small>
              )}
            </div>
            
            {/* Additional Details */}
            {item.details && (
              <div className='timeline-details' style={{ fontSize: '0.8125rem', color: '#6c757d' }}>
                {typeof item.details === 'string' ? (
                  <p className='mb-0'>{item.details}</p>
                ) : (
                  <div className='timeline-details-content'>
                    {item.details.description && (
                      <p className='mb-1'>{item.details.description}</p>
                    )}
                    {item.details.from && item.details.to && (
                      <div className='status-change-info'>
                        <span className='badge bg-light text-dark me-1'>{item.details.from}</span>
                        <i className='material-icons mx-1' style={{ fontSize: '16px', verticalAlign: 'middle' }}>
                          arrow_forward
                        </i>
                        <span className='badge bg-primary text-white'>{item.details.to}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;