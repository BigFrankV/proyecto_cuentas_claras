import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  disabled?: boolean;
  completed?: boolean;
}

export default function FormSection({
  title,
  children,
  action,
  disabled = false,
  completed = false,
}: FormSectionProps) {
  return (
    <div
      className={`form-section mb-4 ${disabled ? 'disabled' : ''}`}
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        className='form-section-header d-flex justify-content-between align-items-center'
        style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          backgroundColor: completed ? '#d1edff' : '#f9f9fa',
        }}
      >
        <div className='d-flex align-items-center'>
          <h6 className='mb-0'>{title}</h6>
          {completed && (
            <i
              className='material-icons text-success ms-2'
              style={{ fontSize: '20px' }}
            >
              check_circle
            </i>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className='form-section-body' style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}

