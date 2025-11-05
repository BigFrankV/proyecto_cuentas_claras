import React, { useState } from 'react';

export interface CommentData {
  content: string;
  isInternal: boolean;
  attachments?: File[];
}

interface CommentFormProps {
  onSubmit: (comment: CommentData) => Promise<void>;
  placeholder?: string;
  showInternalOption?: boolean;
  showAttachments?: boolean;
  isSubmitting?: boolean;
  className?: string;
  minRows?: number;
  maxRows?: number;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = 'Escribe tu comentario...',
  showInternalOption = true,
  showAttachments = true,
  isSubmitting = false,
  className = '',
  minRows = 3,
  maxRows = 8,
}) => {
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const commentData: CommentData = {
      content: content.trim(),
      isInternal,
      ...(attachments.length > 0 && { attachments }),
    };

    try {
      await onSubmit(commentData);

      // Reset form after successful submission
      setContent('');
      setIsInternal(false);
      setAttachments([]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting comment:', error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <form onSubmit={handleSubmit} className={`comment-form ${className}`}>
      <div className='mb-3'>
        <label className='form-label'>
          <i className='material-icons me-2'>comment</i>
          Comentario
        </label>
        <textarea
          className={`form-control ${isDragging ? 'border-primary' : ''}`}
          rows={minRows}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`,
            resize: 'vertical',
          }}
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
          onDragOver={showAttachments ? handleDragOver : undefined}
          onDragLeave={showAttachments ? handleDragLeave : undefined}
          onDrop={showAttachments ? handleDrop : undefined}
          disabled={isSubmitting}
          required
        />
        {showAttachments && isDragging && (
          <div
            className='drag-overlay'
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(13, 110, 253, 0.1)',
              border: '2px dashed var(--color-primary)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <div className='text-center'>
              <i
                className='material-icons mb-2'
                style={{ fontSize: '2rem', color: 'var(--color-primary)' }}
              >
                cloud_upload
              </i>
              <p className='mb-0 text-primary fw-semibold'>
                Suelta los archivos aquí
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Attachments */}
      {showAttachments && (
        <div className='mb-3'>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <label className='form-label mb-0'>
              <i className='material-icons me-2'>attach_file</i>
              Archivos Adjuntos
            </label>
            <button
              type='button'
              className='btn btn-outline-secondary btn-sm'
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.txt';
                input.onchange = e => {
                  const target = e.target as HTMLInputElement;
                  handleFileSelect(target.files);
                };
                input.click();
              }}
              disabled={isSubmitting}
            >
              <i className='material-icons me-1'>add</i>
              Agregar
            </button>
          </div>

          {attachments.length > 0 && (
            <div className='attachments-list'>
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className='attachment-item d-flex align-items-center justify-content-between p-2 border rounded mb-2'
                  style={{ backgroundColor: '#f8f9fa' }}
                >
                  <div className='d-flex align-items-center'>
                    <i className='material-icons me-2 text-primary'>
                      description
                    </i>
                    <div>
                      <div
                        className='fw-semibold'
                        style={{ fontSize: '0.875rem' }}
                      >
                        {file.name}
                      </div>
                      <small className='text-muted'>
                        {formatFileSize(file.size)}
                      </small>
                    </div>
                  </div>
                  <button
                    type='button'
                    className='btn btn-sm btn-outline-danger'
                    onClick={() => removeAttachment(index)}
                    disabled={isSubmitting}
                  >
                    <i className='material-icons'>delete</i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachments.length === 0 && (
            <div
              className='attachment-dropzone text-center py-3'
              style={{
                border: '2px dashed #dee2e6',
                borderRadius: 'var(--radius)',
                backgroundColor: '#f8f9fa',
              }}
            >
              <i
                className='material-icons mb-2'
                style={{ fontSize: '2rem', color: '#6c757d' }}
              >
                cloud_upload
              </i>
              <p className='text-muted mb-0'>
                Arrastra archivos aquí o usa el botón &quot;Agregar&quot;
              </p>
              <small className='text-muted'>
                Formatos: PDF, JPG, PNG, DOC, DOCX, TXT (Max: 10MB)
              </small>
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className='d-flex justify-content-between align-items-center'>
        <div className='form-options'>
          {showInternalOption && (
            <div className='form-check'>
              <input
                className='form-check-input'
                type='checkbox'
                id='internalComment'
                checked={isInternal}
                onChange={e => setIsInternal(e.target.checked)}
                disabled={isSubmitting}
              />
              <label className='form-check-label' htmlFor='internalComment'>
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  lock
                </i>
                Comentario interno
              </label>
            </div>
          )}
        </div>

        <div className='form-actions d-flex gap-2'>
          <button
            type='button'
            className='btn btn-outline-secondary'
            onClick={() => {
              setContent('');
              setIsInternal(false);
              setAttachments([]);
            }}
            disabled={isSubmitting || (!content && attachments.length === 0)}
          >
            Limpiar
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                ></span>
                Enviando...
              </>
            ) : (
              <>
                <i className='material-icons me-2'>send</i>
                Enviar Comentario
              </>
            )}
          </button>
        </div>
      </div>

      {/* Character Count */}
      <div className='d-flex justify-content-between mt-2'>
        <small className='text-muted'>
          {attachments.length > 0 &&
            `${attachments.length} archivo(s) adjunto(s)`}
        </small>
        <small className='text-muted'>{content.length} caracteres</small>
      </div>
    </form>
  );
};

export default CommentForm;
