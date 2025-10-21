import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { CategoryBadge, AccessBadge, FileIcon, VersionBadge } from '@/components/documentos';

interface Document {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'financial' | 'technical' | 'administrative' | 'maintenance' | 'meeting';
  access: 'public' | 'residents' | 'owners' | 'admin';
  fileName: string;
  fileSize: string;
  version: string;
  isLatest: boolean;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  notes?: string;
}

export default function EditarDocumento() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [access, setAccess] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // File upload
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Mock data
    setTimeout(() => {
      const mockDocument: Document = {
        id: id as string,
        name: id === '1' ? 'Reglamento de Copropiedad' : 'Acta Asamblea Extraordinaria',
        description: id === '1' 
          ? 'Documento oficial con las normas y reglamentos de la copropiedad'
          : 'Acta de la asamblea extraordinaria del 25 de enero 2024',
        category: id === '1' ? 'legal' : 'meeting',
        access: id === '1' ? 'public' : 'residents',
        fileName: id === '1' ? 'reglamento-copropiedad.pdf' : 'acta-asamblea-25-ene-2024.doc',
        fileSize: id === '1' ? '2.5 MB' : '124 KB',
        version: id === '1' ? '2.1' : '1.0',
        isLatest: true,
        uploadedBy: id === '1' ? 'Admin' : 'Secretaria',
        uploadedAt: id === '1' ? '2024-01-15T10:30:00Z' : '2024-01-26T16:20:00Z',
        tags: id === '1' 
          ? ['reglamento', 'normas', 'oficial']
          : ['acta', 'asamblea', 'reunión'],
        notes: id === '1' 
          ? 'Documento actualizado con las últimas modificaciones aprobadas en asamblea extraordinaria'
          : 'Acta oficial de la asamblea extraordinaria convocada para tratar temas urgentes'
      };

      setDocument(mockDocument);
      setName(mockDocument.name);
      setDescription(mockDocument.description);
      setCategory(mockDocument.category);
      setAccess(mockDocument.access);
      setNotes(mockDocument.notes || '');
      setTags(mockDocument.tags);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent, createNewVersion = false) => {
    e.preventDefault();
    if (!document) return;

    setSaving(true);

    // Simulate file upload if new file is selected
    if (newFile) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }

    // Mock save
    setTimeout(() => {
      setSaving(false);
      setUploadProgress(0);
      
      const action = createNewVersion ? 'nueva versión creada' : 'documento actualizado';
      alert(`Documento ${action} exitosamente`);
      
      router.push(`/documentos/${id}`);
    }, newFile ? 2500 : 800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Editar Documento'>
          <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando documento...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!document) {
    return (
      <ProtectedRoute>
        <Layout title='Documento no encontrado'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <h3>Documento no encontrado</h3>
              <p className='text-muted'>El documento que intentas editar no existe.</p>
              <Link href='/documentos' className='btn btn-primary'>
                Volver a Documentos
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Editar {document.name} — Documentos — Cuentas Claras</title>
      </Head>

      <Layout title='Editar Documento'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/documentos' className='text-decoration-none'>
                  Documentos
                </Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href={`/documentos/${document.id}`} className='text-decoration-none'>
                  {document.name}
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Editar
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Editar Documento</h1>
              <p className='text-muted mb-0'>Modifica la información del documento o sube una nueva versión</p>
            </div>
            <div className='d-flex gap-2'>
              <Link href={`/documentos/${document.id}`} className='btn btn-outline-secondary'>
                <i className='material-icons me-2'>close</i>
                Cancelar
              </Link>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8'>
              {/* Edit Form */}
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Información del Documento</h5>

                    <div className='row g-3'>
                      <div className='col-12'>
                        <label htmlFor='name' className='form-label'>
                          Nombre del documento *
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='name'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className='col-12'>
                        <label htmlFor='description' className='form-label'>
                          Descripción
                        </label>
                        <textarea
                          className='form-control'
                          id='description'
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder='Descripción detallada del documento...'
                        />
                      </div>

                      <div className='col-md-6'>
                        <label htmlFor='category' className='form-label'>
                          Categoría *
                        </label>
                        <select
                          className='form-select'
                          id='category'
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value=''>Seleccionar categoría</option>
                          <option value='legal'>Legal</option>
                          <option value='financial'>Financiero</option>
                          <option value='technical'>Técnico</option>
                          <option value='administrative'>Administrativo</option>
                          <option value='maintenance'>Mantenimiento</option>
                          <option value='meeting'>Reuniones</option>
                        </select>
                      </div>

                      <div className='col-md-6'>
                        <label htmlFor='access' className='form-label'>
                          Nivel de acceso *
                        </label>
                        <select
                          className='form-select'
                          id='access'
                          value={access}
                          onChange={(e) => setAccess(e.target.value)}
                          required
                        >
                          <option value=''>Seleccionar nivel</option>
                          <option value='public'>Público</option>
                          <option value='residents'>Residentes</option>
                          <option value='owners'>Propietarios</option>
                          <option value='admin'>Administración</option>
                        </select>
                      </div>

                      <div className='col-12'>
                        <label htmlFor='notes' className='form-label'>
                          Notas adicionales
                        </label>
                        <textarea
                          className='form-control'
                          id='notes'
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder='Notas o comentarios adicionales...'
                        />
                      </div>

                      {/* Tags */}
                      <div className='col-12'>
                        <label className='form-label'>Etiquetas</label>
                        <div className='tags-container mb-2'>
                          {tags.map((tag, index) => (
                            <span key={index} className='badge bg-light text-dark me-2 mb-2'>
                              #{tag}
                              <button
                                type='button'
                                className='btn-close btn-close-sm ms-2'
                                onClick={() => removeTag(tag)}
                                style={{ fontSize: '0.6rem' }}
                              ></button>
                            </span>
                          ))}
                        </div>
                        <div className='input-group'>
                          <input
                            type='text'
                            className='form-control'
                            placeholder='Agregar etiqueta...'
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <button
                            type='button'
                            className='btn btn-outline-secondary'
                            onClick={addTag}
                            disabled={!newTag.trim()}
                          >
                            <i className='material-icons'>add</i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Reemplazar Archivo (Opcional)</h5>
                    
                    <div
                      className={`upload-zone border border-2 border-dashed rounded p-4 text-center ${
                        dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {newFile ? (
                        <div className='selected-file'>
                          <FileIcon fileName={newFile.name} size='lg' />
                          <h6 className='mt-3 mb-2'>{newFile.name}</h6>
                          <p className='text-muted mb-3'>{formatFileSize(newFile.size)}</p>
                          <button
                            type='button'
                            className='btn btn-outline-danger'
                            onClick={() => setNewFile(null)}
                          >
                            <i className='material-icons me-2'>delete</i>
                            Quitar archivo
                          </button>

                          {uploadProgress > 0 && (
                            <div className='progress mt-3' style={{ height: '8px' }}>
                              <div
                                className='progress-bar'
                                role='progressbar'
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='upload-prompt'>
                          <i className='material-icons mb-3 text-muted' style={{ fontSize: '3rem' }}>
                            cloud_upload
                          </i>
                          <h6 className='mb-2'>Arrastra un archivo aquí o haz clic para seleccionar</h6>
                          <p className='text-muted mb-3'>
                            Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                          </p>
                          <label className='btn btn-outline-primary'>
                            <i className='material-icons me-2'>folder_open</i>
                            Seleccionar archivo
                            <input
                              type='file'
                              className='d-none'
                              accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                              onChange={handleFileSelect}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {newFile && (
                      <div className='alert alert-info mt-3'>
                        <i className='material-icons me-2'>info</i>
                        Al subir un nuevo archivo, se creará automáticamente una nueva versión del documento.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='d-flex justify-content-end gap-2'>
                  <Link href={`/documentos/${document.id}`} className='btn btn-outline-secondary'>
                    Cancelar
                  </Link>
                  {newFile ? (
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={saving}
                      onClick={(e) => handleSubmit(e, true)}
                    >
                      {saving ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                          Creando nueva versión...
                        </>
                      ) : (
                        <>
                          <i className='material-icons me-2'>upload</i>
                          Crear Nueva Versión
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className='material-icons me-2'>save</i>
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className='col-lg-4'>
              {/* Current Document Info */}
              <div className='card shadow-sm mb-4'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Documento Actual</h6>
                  
                  <div className='d-flex align-items-center mb-3'>
                    <FileIcon fileName={document.fileName} size='md' />
                    <div className='ms-3'>
                      <div className='fw-medium'>{document.fileName}</div>
                      <div className='text-muted small'>{document.fileSize}</div>
                    </div>
                  </div>

                  <div className='d-flex gap-2 mb-3'>
                    <CategoryBadge category={document.category as any} size='sm' />
                    <AccessBadge access={document.access as any} size='sm' />
                    <VersionBadge version={document.version} isLatest={document.isLatest} size='sm' />
                  </div>

                  <div className='document-meta text-muted small'>
                    <div className='mb-1'>
                      <i className='material-icons me-1' style={{ fontSize: '14px' }}>person</i>
                      {document.uploadedBy}
                    </div>
                    <div>
                      <i className='material-icons me-1' style={{ fontSize: '14px' }}>access_time</i>
                      {new Date(document.uploadedAt).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className='card shadow-sm'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Ayuda</h6>
                  <div className='help-content'>
                    <div className='help-item mb-3'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>edit</i>
                        Editar información
                      </h6>
                      <p className='help-text text-muted small'>
                        Puedes modificar el nombre, descripción, categoría y nivel de acceso sin subir un nuevo archivo.
                      </p>
                    </div>
                    <div className='help-item mb-3'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>upload</i>
                        Nueva versión
                      </h6>
                      <p className='help-text text-muted small'>
                        Al subir un nuevo archivo, se creará automáticamente una nueva versión manteniendo el historial.
                      </p>
                    </div>
                    <div className='help-item'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>label</i>
                        Etiquetas
                      </h6>
                      <p className='help-text text-muted small'>
                        Usa etiquetas para facilitar la búsqueda y organización de documentos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}