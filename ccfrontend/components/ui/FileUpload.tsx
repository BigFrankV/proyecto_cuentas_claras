import { useState, useRef } from 'react';

import fileService, {
  FileUploadOptions,
  UploadedFile,
} from '@/lib/fileService';

interface FileUploadProps {
  options: FileUploadOptions;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  options,
  multiple = false,
  accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip',
  maxSizeMB = 10,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className = '',
  children,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    await handleFiles(files);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) {
      return;
    }

    await handleFiles(files);
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validar archivos
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) {
          continue;
        }

        // Validar tipo
        if (!fileService.validateFileType(file)) {
          errors.push(`${file.name}: Tipo de archivo no permitido`);
          continue;
        }

        // Validar tamaño
        if (!fileService.validateFileSize(file, maxSizeMB)) {
          errors.push(
            `${file.name}: Archivo demasiado grande (máximo ${maxSizeMB}MB)`
          );
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        onUploadError?.(errors.join('\n'));
        if (validFiles.length === 0) {
          setIsUploading(false);
          return;
        }
      }

      // Subir archivos válidos
      const uploadedFiles = await fileService.uploadFiles(validFiles, options);

      setUploadProgress(100);
      onUploadSuccess?.(uploadedFiles);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading files:', error);
      onUploadError?.(
        error instanceof Error ? error.message : 'Error subiendo archivos'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type='file'
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        style={{ display: 'none' }}
      />

      <div
        className={`upload-area ${isUploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() =>
          !disabled && !isUploading && fileInputRef.current?.click()
        }
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isUploading ? '#f8f9fa' : 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {children || (
          <>
            {isUploading ? (
              <div>
                <div
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                >
                  <span className='visually-hidden'>Subiendo...</span>
                </div>
                <span>Subiendo archivos...</span>
                {uploadProgress > 0 && (
                  <div className='progress mt-2'>
                    <div
                      className='progress-bar'
                      role='progressbar'
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <i
                  className='material-icons mb-2'
                  style={{ fontSize: '48px', color: '#6c757d' }}
                >
                  cloud_upload
                </i>
                <div>
                  <strong>Haz clic para seleccionar archivos</strong>
                  <br />
                  <small className='text-muted'>
                    o arrastra y suelta aquí
                    <br />
                    Máximo {maxSizeMB}MB por archivo
                  </small>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
