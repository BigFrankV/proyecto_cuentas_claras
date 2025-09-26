import { ActivityBadge, PriorityBadge } from './Badges';

interface TimelineItemProps {
  id: string;
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description: string;
  user: string;
  date: string;
  tags?: string[];
  attachments?: number;
  ip?: string | undefined;
  location?: string | undefined;
}

export default function TimelineItem({
  id,
  type,
  priority,
  title,
  description,
  user,
  date,
  tags = [],
  attachments = 0,
  ip,
  location
}: TimelineItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMarkerClass = (activityType: string) => {
    const classes = {
      system: 'timeline-marker system',
      user: 'timeline-marker user',
      security: 'timeline-marker security',
      maintenance: 'timeline-marker maintenance',
      admin: 'timeline-marker admin',
      financial: 'timeline-marker financial'
    };
    return classes[activityType as keyof typeof classes] || 'timeline-marker';
  };

  return (
    <div className='timeline-item'>
      <div className={getMarkerClass(type)}></div>
      
      <div className='timeline-content'>
        <div className='timeline-header'>
          <div className='timeline-info'>
            <div className='timeline-action'>{title}</div>
            <div className='timeline-description'>{description}</div>
          </div>
          <div className='timeline-badges d-flex gap-2'>
            <ActivityBadge type={type} size='sm' />
            <PriorityBadge priority={priority} size='sm' />
          </div>
        </div>

        <div className='timeline-meta'>
          <div className='timeline-meta-item'>
            <i className='material-icons me-1'>person</i>
            {user}
          </div>
          <div className='timeline-meta-item'>
            <i className='material-icons me-1'>access_time</i>
            {formatDate(date)}
          </div>
          {ip && (
            <div className='timeline-meta-item'>
              <i className='material-icons me-1'>router</i>
              {ip}
            </div>
          )}
          {location && (
            <div className='timeline-meta-item'>
              <i className='material-icons me-1'>location_on</i>
              {location}
            </div>
          )}
          {attachments > 0 && (
            <div className='timeline-meta-item'>
              <i className='material-icons me-1'>attach_file</i>
              {attachments} archivo{attachments > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className='timeline-tags mt-2'>
            {tags.map((tag, index) => (
              <span key={index} className='badge bg-light text-dark me-1'>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .timeline-item {
          position: relative;
          padding: 1.5rem 1.5rem 1.5rem 4rem;
          border-bottom: 1px solid #f8f9fa;
        }

        .timeline-item:last-child {
          border-bottom: none;
        }

        .timeline-marker {
          position: absolute;
          left: 22px;
          top: 1.5rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid #fff;
          background-color: #007bff;
          box-shadow: 0 0 0 3px #e9ecef;
        }

        .timeline-marker.system {
          background-color: #17a2b8;
        }

        .timeline-marker.user {
          background-color: #28a745;
        }

        .timeline-marker.security {
          background-color: #dc3545;
        }

        .timeline-marker.maintenance {
          background-color: #ffc107;
        }

        .timeline-marker.admin {
          background-color: #6f42c1;
        }

        .timeline-marker.financial {
          background-color: #fd7e14;
        }

        .timeline-content {
          position: relative;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .timeline-action {
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }

        .timeline-description {
          color: #6c757d;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        .timeline-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .timeline-meta-item {
          display: flex;
          align-items: center;
        }

        .timeline-meta-item .material-icons {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .timeline-item {
            padding: 1rem 1rem 1rem 3rem;
          }

          .timeline-marker {
            left: 14px;
            width: 12px;
            height: 12px;
          }

          .timeline-header {
            flex-direction: column;
            align-items: start;
          }

          .timeline-meta {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}