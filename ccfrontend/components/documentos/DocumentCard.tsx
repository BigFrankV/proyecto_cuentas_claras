import AccessBadge from './AccessBadge';
import CategoryBadge from './CategoryBadge';
import FileIcon from './FileIcon';
import VersionBadge from './VersionBadge';

interface Document {
  id: string;
  name: string;
  description: string;
  category:
    | 'legal'
    | 'financial'
    | 'technical'
    | 'administrative'
    | 'maintenance'
    | 'meeting';
  access: 'public' | 'residents' | 'owners' | 'admin';
  fileName: string;
  fileSize: string;
  version: string;
  isLatest: boolean;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

interface DocumentCardProps {
  document: Document;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DocumentCard({
  document,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='document-card card h-100'>
      <div className='card-body p-3'>
        {/* Header with file icon and actions */}
        <div className='document-card-header d-flex align-items-start justify-content-between mb-3'>
          <div className='d-flex align-items-center'>
            <FileIcon fileName={document.fileName} size='md' />
            <div className='document-info ms-3'>
              <h6 className='document-name mb-1'>{document.name}</h6>
              <div className='document-description text-muted small'>
                {document.description}
              </div>
            </div>
          </div>

          <div className='dropdown'>
            <button
              className='btn btn-sm btn-outline-secondary dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
              aria-expanded='false'
            >
              <i className='material-icons'>more_vert</i>
            </button>
            <ul className='dropdown-menu dropdown-menu-end'>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onView(document.id)}
                >
                  <i className='material-icons me-2'>visibility</i>
                  Ver
                </button>
              </li>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onDownload(document.id)}
                >
                  <i className='material-icons me-2'>download</i>
                  Descargar
                </button>
              </li>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onEdit(document.id)}
                >
                  <i className='material-icons me-2'>edit</i>
                  Editar
                </button>
              </li>
              <li>
                <hr className='dropdown-divider' />
              </li>
              <li>
                <button
                  className='dropdown-item text-danger'
                  onClick={() => onDelete(document.id)}
                >
                  <i className='material-icons me-2'>delete</i>
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Badges */}
        <div className='document-badges d-flex flex-wrap gap-2 mb-3'>
          <CategoryBadge category={document.category} size='sm' />
          <AccessBadge access={document.access} size='sm' />
          <VersionBadge
            version={document.version}
            isLatest={document.isLatest}
            size='sm'
          />
        </div>

        {/* Meta information */}
        <div className='document-meta'>
          <div className='document-meta-item d-flex align-items-center mb-2'>
            <i
              className='material-icons me-2 text-muted'
              style={{ fontSize: '16px' }}
            >
              insert_drive_file
            </i>
            <span className='small text-muted'>
              {document.fileName} ({document.fileSize})
            </span>
          </div>
          <div className='document-meta-item d-flex align-items-center mb-2'>
            <i
              className='material-icons me-2 text-muted'
              style={{ fontSize: '16px' }}
            >
              person
            </i>
            <span className='small text-muted'>{document.uploadedBy}</span>
          </div>
          <div className='document-meta-item d-flex align-items-center'>
            <i
              className='material-icons me-2 text-muted'
              style={{ fontSize: '16px' }}
            >
              schedule
            </i>
            <span className='small text-muted'>
              {formatDate(document.uploadedAt)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className='document-tags mt-3'>
            <div className='d-flex flex-wrap gap-1'>
              {document.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className='badge bg-light text-dark'>
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className='badge bg-light text-muted'>
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='document-actions-mobile card-footer bg-transparent border-0 pt-0'>
        <div className='d-flex gap-2'>
          <button
            className='btn btn-sm btn-outline-primary flex-fill'
            onClick={() => onView(document.id)}
          >
            <i className='material-icons me-1' style={{ fontSize: '16px' }}>
              visibility
            </i>
            Ver
          </button>
          <button
            className='btn btn-sm btn-outline-secondary'
            onClick={() => onDownload(document.id)}
          >
            <i className='material-icons' style={{ fontSize: '16px' }}>
              download
            </i>
          </button>
        </div>
      </div>
    </div>
  );
}
