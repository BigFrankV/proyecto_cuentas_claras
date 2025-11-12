import Link from 'next/link';
import { ReactNode } from 'react';

interface StatCard {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  primaryAction?: {
    href: string;
    label: string;
    icon: string;
  };
  stats?: StatCard[];
  gradient?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  primaryAction,
  stats = [],
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  children,
}: PageHeaderProps) {
  return (
    <div className='container-fluid p-0'>
      <div
        className='text-white'
        style={{
          background: gradient,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className='p-4'>
          {/* Elementos decorativos */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-5%',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
            }}
          />

          {/* Header principal */}
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-center'>
              <div
                className='me-4'
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className='material-icons'
                  style={{ fontSize: '32px', color: 'white' }}
                >
                  {icon}
                </i>
              </div>
              <div>
                <h1 className='h2 mb-1 text-white'>{title}</h1>
                <p className='mb-0 opacity-75'>{subtitle}</p>
              </div>
            </div>
            {primaryAction && (
              <div className='text-end'>
                <Link
                  href={primaryAction.href}
                  className='btn btn-light btn-lg'
                >
                  <i className='material-icons me-2'>{primaryAction.icon}</i>
                  {primaryAction.label}
                </Link>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          {stats.length > 0 && (
            <div className='row mt-4 g-0'>
              {stats.map((stat, index) => (
                <div key={index} className='col-md-3 mb-3'>
                  <div
                    className='p-3 rounded-3 text-white'
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className='d-flex align-items-center'>
                      <div
                        className='me-3'
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: stat.color,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className='material-icons'>{stat.icon}</i>
                      </div>
                      <div>
                        <div className='h3 mb-0'>{stat.value}</div>
                        <div className='text-white-50'>{stat.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contenido adicional */}
          {children}
        </div>
      </div>
    </div>
  );
}