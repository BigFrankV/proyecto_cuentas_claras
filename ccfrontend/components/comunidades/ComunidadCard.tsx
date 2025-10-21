import React from 'react';
import Link from 'next/link';
import { Comunidad } from '@/types/comunidades';
import comunidadesService from '@/lib/comunidadesService';

interface ComunidadCardProps {
  comunidad: Comunidad;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ComunidadCard: React.FC<ComunidadCardProps> = ({ comunidad, onEdit, onDelete }) => {
  const ocupacionPorcentaje = comunidad.totalUnidades > 0 
    ? (comunidad.unidadesOcupadas / comunidad.totalUnidades) * 100 
    : 0;
  
  const morosidadPorcentaje = comunidad.morosidad || 0;
  const ingresosMensuales = comunidad.ingresosMensuales || 0;
  const gastosMensuales = comunidad.gastosMensuales || 0;
  const saldoPendiente = comunidad.saldoPendiente || 0;
  
  return (
    <div className="col-md-6 col-lg-4 col-xl-3">
      <div className="card comunidad-card app-card h-100">
        {/* Imagen de la comunidad */}
        <div className="position-relative">
          <img
            src={comunidad.imagen || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
            className="card-img-top"
            alt={comunidad.nombre}
            style={{ height: '180px', objectFit: 'cover' }}
          />
          
          {/* Badge de estado */}
          <span className={`badge position-absolute top-0 end-0 m-2 ${comunidadesService.getEstadoBadgeClass(comunidad.estado)}`}>
            {comunidad.estado}
          </span>
          
          {/* Acciones flotantes */}
          <div className="comunidad-actions position-absolute top-0 start-0 m-2 opacity-0 transition-opacity">
            <div className="dropdown">
              <button
                className="btn btn-sm btn-light btn-floating rounded-circle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: '32px', height: '32px', padding: '0' }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>more_vert</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-start">
                <li>
                  <Link href={`/comunidades/${comunidad.id}`} className="dropdown-item">
                    <span className="material-icons me-2">visibility</span>
                    Ver detalles
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => onEdit?.(comunidad.id)}>
                    <span className="material-icons me-2">edit</span>
                    Editar
                  </button>
                </li>
                <li>
                  <Link href={`/comunidades/${comunidad.id}/parametros`} className="dropdown-item">
                    <span className="material-icons me-2">settings</span>
                    Parámetros
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => onDelete?.(comunidad.id)}>
                    <span className="material-icons me-2">delete</span>
                    Eliminar
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contenido de la tarjeta */}
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <h5 className="card-title mb-0">{comunidad.nombre}</h5>
            <span className="material-icons text-muted">
              {comunidadesService.getTipoComunidadIcon(comunidad.tipo)}
            </span>
          </div>
          
          <p className="card-text text-muted small mb-3">{comunidad.direccion}</p>
          
          {/* Estadísticas principales */}
          <div className="row g-2 mb-3">
            <div className="col-4">
              <div className="text-center">
                <div className="h6 mb-0">{comunidad.totalUnidades}</div>
                <small className="text-muted">Unidades</small>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center">
                <div className="h6 mb-0">{ocupacionPorcentaje.toFixed(0)}%</div>
                <small className="text-muted">Ocupación</small>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center">
                <div className={`h6 mb-0 ${morosidadPorcentaje > 15 ? 'text-danger' : morosidadPorcentaje > 5 ? 'text-warning' : 'text-success'}`}>
                  {morosidadPorcentaje.toFixed(1)}%
                </div>
                <small className="text-muted">Morosidad</small>
              </div>
            </div>
          </div>

          {/* Estadísticas financieras */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="text-center p-2 bg-light rounded">
                <div className="small text-success fw-bold">
                  ${(ingresosMensuales / 1000000).toFixed(1)}M
                </div>
                <small className="text-muted">Ingresos</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-2 bg-light rounded">
                <div className="small text-danger fw-bold">
                  ${(gastosMensuales / 1000000).toFixed(1)}M
                </div>
                <small className="text-muted">Gastos</small>
              </div>
            </div>
          </div>

          {/* Saldo pendiente */}
          {saldoPendiente > 0 && (
            <div className="alert alert-warning py-2 mb-3" style={{ fontSize: '0.8rem' }}>
              <strong>Saldo pendiente:</strong> ${(saldoPendiente / 1000000).toFixed(1)}M
            </div>
          )}

          {/* Administrador */}
          <div className="mt-auto">
            <div className="d-flex align-items-center">
              <span className="material-icons me-2 text-muted" style={{ fontSize: '18px' }}>person</span>
              <small className="text-muted">{comunidad.administrador}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComunidadCard;