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
          <span className={`badge badge-status position-absolute top-0 end-0 m-2 ${comunidadesService.getEstadoBadgeClass(comunidad.estado)}`}>
            {comunidad.estado}
          </span>
          
          {/* Acciones flotantes */}
          <div className="comunidad-actions">
            <div className="dropdown">
              <button
                className="btn btn-sm btn-light btn-floating"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="material-icons">more_vert</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
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
            <div className="col-6">
              <div className="text-center">
                <div className="h6 mb-0">{comunidad.totalUnidades}</div>
                <small className="text-muted">Unidades</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center">
                <div className="h6 mb-0">{ocupacionPorcentaje.toFixed(0)}%</div>
                <small className="text-muted">Ocupación</small>
              </div>
            </div>
          </div>
          
          {/* Barra de progreso de ocupación */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small className="text-muted">Ocupación</small>
              <small className="text-muted">{comunidad.unidadesOcupadas}/{comunidad.totalUnidades}</small>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${ocupacionPorcentaje}%` }}
                aria-valuenow={ocupacionPorcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
          
          {/* Información financiera */}
          <div className="row g-2 mb-3">
            <div className="col-12">
              <div className="d-flex justify-content-between">
                <small className="text-muted">Saldo pendiente:</small>
                <small className={`fw-bold ${comunidad.saldoPendiente > 0 ? 'text-warning' : 'text-success'}`}>
                  {comunidadesService.formatCurrency(comunidad.saldoPendiente)}
                </small>
              </div>
            </div>
          </div>
          
          {/* Morosidad */}
          <div className="row g-2 mb-3">
            <div className="col-12">
              <div className="d-flex justify-content-between">
                <small className="text-muted">Morosidad:</small>
                <small className={`fw-bold ${comunidad.morosidad > 10 ? 'text-danger' : comunidad.morosidad > 5 ? 'text-warning' : 'text-success'}`}>
                  {comunidadesService.formatPercentage(comunidad.morosidad)}
                </small>
              </div>
            </div>
          </div>
          
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