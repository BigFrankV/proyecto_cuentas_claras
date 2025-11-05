import { useState, useEffect } from 'react';

import fileService, { FileListItem } from '@/lib/fileService';

interface FileListProps {
  comunidadId?: number;
  entityType?: string;
  entityId?: number;
  category?: string;
  showActions?: boolean;
  onFileDelete?: (fileId: number) => void;
  className?: string;
}

export default function FileList({
  comunidadId,
  entityType,
  entityId,
  category,
  showActions = true,
  onFileDelete,
  className = '',
}: FileListProps) {
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [comunidadId, entityType, entityId, category]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: any = {};
      if (comunidadId) {
        options.comunidadId = comunidadId;
      }
      if (entityType) {
        options.entityType = entityType;
      }
      if (entityId) {
        options.entityId = entityId;
      }
      if (category) {
        options.category = category;
      }

      const fileList = await fileService.getFiles(options);

      setFiles(fileList);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading files:', error);
      setError('Error cargando archivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileListItem) => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (file: FileListItem) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar ${file.originalName}?`,
      )
    ) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      setFiles(files.filter(f => f.id !== file.id));
      onFileDelete?.(file.id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting file:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`d-flex justify-content-center p-4 ${className}`}>
        <div className='spinner-border' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`alert alert-danger ${className}`}>
        <i className='material-icons me-2'>error</i>
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center p-4 text-muted ${className}`}>
        <i className='material-icons mb-2' style={{ fontSize: '48px' }}>
          folder_open
        </i>
        <div>No hay archivos</div>
      </div>
    );
  }

  return (
    <div className={`file-list ${className}`}>
      <div className='list-group'>
        {files.map(file => (
          <div
            key={file.id}
            className='list-group-item d-flex align-items-center'
          >
            <div className='me-3'>
              <i
                className='material-icons'
                style={{ fontSize: '24px', color: '#6c757d' }}
              >
                {fileService.getFileIcon(file.mimetype)}
              </i>
            </div>

            <div className='flex-grow-1'>
              <div className='fw-semibold'>{file.originalName}</div>
              <div className='small text-muted'>
                {fileService.formatFileSize(file.size)}
                {file.uploadedAt && (
                  <>
                    {' • '}
                    {formatDate(file.uploadedAt)}
                  </>
                )}
                {file.description && (
                  <>
                    {' • '}
                    {file.description}
                  </>
                )}
              </div>
            </div>

            {showActions && (
              <div className='btn-group'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-primary'
                  onClick={() => handleDownload(file)}
                  title='Descargar'
                >
                  <i className='material-icons' style={{ fontSize: '16px' }}>
                    download
                  </i>
                </button>

                {file.previewUrl && file.mimetype.startsWith('image/') && (
                  <button
                    type='button'
                    className='btn btn-sm btn-outline-secondary'
                    onClick={() => window.open(file.previewUrl, '_blank')}
                    title='Ver imagen'
                  >
                    <i className='material-icons' style={{ fontSize: '16px' }}>
                      visibility
                    </i>
                  </button>
                )}

                <button
                  type='button'
                  className='btn btn-sm btn-outline-danger'
                  onClick={() => handleDelete(file)}
                  title='Eliminar'
                >
                  <i className='material-icons' style={{ fontSize: '16px' }}>
                    delete
                  </i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
