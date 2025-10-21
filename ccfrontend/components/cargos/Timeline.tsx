import React from 'react';

export interface TimelineItem {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  content: string;
  date: Date;
  user?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className = '' }: TimelineProps) {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimelineItemClass = (type: string): string => {
    return `timeline-item ${type}`;
  };

  return (
    <div className={`timeline ${className}`}>
      {items.map((item) => (
        <div key={item.id} className={getTimelineItemClass(item.type)}>
          <div className="timeline-header d-flex justify-content-between align-items-start">
            <h6 className="timeline-title mb-1">{item.title}</h6>
            <small className="timeline-date text-muted">
              {formatDate(item.date)}
            </small>
          </div>
          
          <div className="timeline-content">
            <p className="mb-1">{item.content}</p>
            {item.user && (
              <small className="timeline-user text-muted d-block">
                <i className="material-icons me-1" style={{ fontSize: '14px' }}>person</i>
                {item.user}
              </small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}