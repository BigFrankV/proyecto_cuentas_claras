import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';

import { FileIcon } from '@/components/documentos';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
}

export default function NuevoDocumento() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [versionOption, setVersionOption] = useState('new');
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [tags, setTags] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    {
      id: 'legal',
      name: 'Legal',
      icon: 'gavel',
      description: 'Contratos, reglamentos, actas',
    },
    {
      id: 'financial',
      name: 'Financiero',
      icon: 'attach_money',
      description: 'Estados, presupuestos, pagos',
    },
    {
      id: 'technical',
      name: 'Técnico',
      icon: 'build',
      description: 'Manuales, especificaciones',
    },
    {
      id: 'administrative',
      name: 'Administrativo',
      icon: 'business',
      description: 'Procedimientos, políticas',
    },
    {
      id: 'maintenance',
      name: 'Mantenimiento',
      icon: 'handyman',
      description: 'Reportes, programación',
    },
    {
      id: 'meeting',
      name: 'Reuniones',
      icon: 'groups',
      description: 'Actas, convocatorias',
    },
  ];

  const accessLevels = [
    {
      id: 'public',
      name: 'Público',
      icon: 'public',
      description: 'Visible para todos los usuarios',
    },
    {
      id: 'residents',
      name: 'Residentes',
      icon: 'home',
      description: 'Solo residentes pueden ver',
    },
    {
      id: 'owners',
      name: 'Propietarios',
      icon: 'vpn_key',
      description: 'Solo propietarios pueden ver',
    },
    {
      id: 'admin',
      name: 'Administración',
      icon: 'admin_panel_settings',
      description: 'Solo administradores',
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploaded: false,
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      const interval = setInterval(() => {
        setSelectedFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f,
          ),
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setSelectedFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: 100, uploaded: true } : f,
          ),
        );
      }, 2000);
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert('Debes seleccionar al menos un archivo');
      return;
    }

    if (!selectedCategory) {
      alert('Debes seleccionar una categoría');
      return;
    }

    if (!selectedAccess) {
      alert('Debes seleccionar un nivel de acceso');
      return;
    }

    if (!documentName) {
      alert('Debes ingresar un nombre para el documento');
      return;
    }

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      alert('Documento subido exitosamente');
      router.push('/documentos');
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Subir Documento — Cuentas Claras</title>
      </Head>

      <Layout title='Subir Documento'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex align-items-center mb-4'>
            <Link href='/documentos' className='btn btn-outline-secondary me-3'>
              <i className='material-icons me-2'>arrow_back</i>
              Volver
            </Link>
            <div>
              <h1 className='h3 mb-1'>Subir Documento</h1>
              <p className='text-muted mb-0'>
                Sube documentos para compartir con la comunidad
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Upload Area */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-card-header mb-4'>
                      <h5 className='form-card-title d-flex align-items-center mb-0'>
                        <i className='material-icons me-2'>cloud_upload</i>
                        Archivos
                      </h5>
                    </div>

                    <div
                      className={`upload-area border-2 border-dashed rounded-3 p-4 text-center ${dragOver ? 'border-primary bg-light' : 'border-secondary'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        cursor: 'pointer',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div className='upload-icon mb-3'>
                        <i
                          className='material-icons text-primary'
                          style={{ fontSize: '4rem' }}
                        >
                          cloud_upload
                        </i>
                      </div>
                      <div className='upload-text mb-2'>
                        <h6>
                          Arrastra archivos aquí o haz clic para seleccionar
                        </h6>
                      </div>
                      <div className='upload-hint text-muted'>
                        <small>
                          Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG,
                          PNG (máx. 10MB)
                        </small>
                      </div>

                      <input
                        ref={fileInputRef}
                        type='file'
                        className='d-none'
                        multiple
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                        onChange={handleFileSelect}
                      />
                    </div>

                    {/* File List */}
                    {selectedFiles.length > 0 && (
                      <div className='file-list mt-4'>
                        <h6 className='mb-3'>
                          Archivos seleccionados ({selectedFiles.length})
                        </h6>
                        {selectedFiles.map(fileItem => (
                          <div
                            key={fileItem.id}
                            className='file-item d-flex align-items-center p-3 mb-2 border rounded-3'
                          >
                            <FileIcon fileName={fileItem.file.name} size='md' />

                            <div className='file-info flex-grow-1 ms-3'>
                              <div className='file-name fw-medium'>
                                {fileItem.file.name}
                              </div>
                              <div className='file-details text-muted small'>
                                {formatFileSize(fileItem.file.size)} •{' '}
                                {fileItem.file.type || 'Archivo'}
                              </div>
                              {!fileItem.uploaded && (
                                <div className='file-progress mt-2'>
                                  <div
                                    className='progress'
                                    style={{ height: '4px' }}
                                  >
                                    <div
                                      className='progress-bar'
                                      role='progressbar'
                                      style={{ width: `${fileItem.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className='file-actions ms-3'>
                              {fileItem.uploaded ? (
                                <span className='text-success me-3'>
                                  <i className='material-icons'>check_circle</i>
                                </span>
                              ) : (
                                <span className='text-primary me-3'>
                                  <i className='material-icons'>upload</i>
                                </span>
                              )}
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                                onClick={() => removeFile(fileItem.id)}
                              >
                                <i className='material-icons'>delete</i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Information */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-card-header mb-4'>
                      <h5 className='form-card-title d-flex align-items-center mb-0'>
                        <i className='material-icons me-2'>info</i>
                        Información del Documento
                      </h5>
                    </div>

                    <div className='row g-3'>
                      <div className='col-md-8'>
                        <label className='form-label'>
                          Nombre del documento *
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Ej: Reglamento de Copropiedad 2024'
                          value={documentName}
                          onChange={e => setDocumentName(e.target.value)}
                          required
                        />
                      </div>

                      <div className='col-md-4'>
                        <label className='form-label'>
                          Fecha de vencimiento
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          value={expirationDate}
                          onChange={e => setExpirationDate(e.target.value)}
                        />
                      </div>

                      <div className='col-12'>
                        <label className='form-label'>Descripción</label>
                        <textarea
                          className='form-control'
                          rows={3}
                          placeholder='Describe brevemente el contenido del documento...'
                          value={documentDescription}
                          onChange={e => setDocumentDescription(e.target.value)}
                        ></textarea>
                      </div>

                      <div className='col-md-6'>
                        <label className='form-label'>Etiquetas</label>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Separadas por comas: presupuesto, 2024, aprobado'
                          value={tags}
                          onChange={e => setTags(e.target.value)}
                        />
                        <div className='form-text'>
                          Las etiquetas ayudan a encontrar el documento más
                          fácilmente
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-lg-4'>
                {/* Category Selection */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-card-header mb-4'>
                      <h5 className='form-card-title d-flex align-items-center mb-0'>
                        <i className='material-icons me-2'>folder</i>
                        Categoría *
                      </h5>
                    </div>

                    <div className='category-grid row g-2'>
                      {categories.map(category => (
                        <div key={category.id} className='col-12'>
                          <div
                            className={`category-card card border-2 ${selectedCategory === category.id ? 'border-primary bg-light' : 'border-light'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <div className='card-body p-3'>
                              <div className='d-flex align-items-center'>
                                <div
                                  className={'category-icon rounded-3 p-2 me-3 text-white'}
                                  style={{
                                    backgroundColor:
                                      category.id === 'legal'
                                        ? '#2196F3'
                                        : category.id === 'financial'
                                          ? '#4CAF50'
                                          : category.id === 'technical'
                                            ? '#FF9800'
                                            : category.id === 'administrative'
                                              ? '#9C27B0'
                                              : category.id === 'maintenance'
                                                ? '#F44336'
                                                : '#009688',
                                  }}
                                >
                                  <i className='material-icons'>
                                    {category.icon}
                                  </i>
                                </div>
                                <div>
                                  <div className='category-name fw-medium'>
                                    {category.name}
                                  </div>
                                  <div className='category-description text-muted small'>
                                    {category.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Access Level */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-card-header mb-4'>
                      <h5 className='form-card-title d-flex align-items-center mb-0'>
                        <i className='material-icons me-2'>security</i>
                        Nivel de Acceso *
                      </h5>
                    </div>

                    <div className='access-grid row g-2'>
                      {accessLevels.map(access => (
                        <div key={access.id} className='col-12'>
                          <div
                            className={`access-card card border-2 ${selectedAccess === access.id ? 'border-primary bg-light' : 'border-light'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedAccess(access.id)}
                          >
                            <div className='card-body p-3'>
                              <div className='d-flex align-items-center'>
                                <div className='access-icon bg-secondary text-white rounded-3 p-2 me-3'>
                                  <i className='material-icons'>
                                    {access.icon}
                                  </i>
                                </div>
                                <div>
                                  <div className='access-name fw-medium'>
                                    {access.name}
                                  </div>
                                  <div className='access-description text-muted small'>
                                    {access.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Version Control */}
                <div className='form-card card shadow-sm mb-4'>
                  <div className='card-body'>
                    <div className='form-card-header mb-4'>
                      <h5 className='form-card-title d-flex align-items-center mb-0'>
                        <i className='material-icons me-2'>history</i>
                        Control de Versión
                      </h5>
                    </div>

                    <div className='version-options'>
                      <div
                        className={`version-option d-flex align-items-center p-3 border rounded-3 mb-2 ${versionOption === 'new' ? 'border-primary bg-light' : 'border-light'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setVersionOption('new')}
                      >
                        <input
                          type='radio'
                          name='version'
                          value='new'
                          checked={versionOption === 'new'}
                          onChange={() => setVersionOption('new')}
                        />
                        <div className='version-info ms-3'>
                          <div className='version-title fw-medium'>
                            Nuevo documento
                          </div>
                          <div className='version-description text-muted small'>
                            Crear un documento completamente nuevo
                          </div>
                        </div>
                      </div>

                      <div
                        className={`version-option d-flex align-items-center p-3 border rounded-3 ${versionOption === 'update' ? 'border-primary bg-light' : 'border-light'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setVersionOption('update')}
                      >
                        <input
                          type='radio'
                          name='version'
                          value='update'
                          checked={versionOption === 'update'}
                          onChange={() => setVersionOption('update')}
                        />
                        <div className='version-info ms-3'>
                          <div className='version-title fw-medium'>
                            Actualizar existente
                          </div>
                          <div className='version-description text-muted small'>
                            Nueva versión de un documento existente
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='action-buttons d-flex gap-3 justify-content-end py-4 border-top'>
              <Link href='/documentos' className='btn btn-outline-secondary'>
                Cancelar
              </Link>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                    ></span>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <i className='material-icons me-2'>cloud_upload</i>
                    Subir Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Upload Progress Modal */}
        {uploading && (
          <div className='upload-progress position-fixed top-0 end-0 m-4 p-3 bg-white rounded-3 shadow-lg border'>
            <div className='d-flex align-items-center'>
              <div
                className='spinner-border spinner-border-sm text-primary me-3'
                role='status'
              ></div>
              <div>
                <div className='fw-medium'>Subiendo documento...</div>
                <div className='text-muted small'>Por favor espera...</div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
