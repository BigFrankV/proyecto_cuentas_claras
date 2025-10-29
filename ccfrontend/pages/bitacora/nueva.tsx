import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ActivityTypeCard, PriorityOption, ActivityBadge, PriorityBadge, FileIcon } from '@/components/bitacora';
import bitacoraService from '@/lib/api/bitacora';
import { useCurrentComunidad } from '@/hooks/useComunidad';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function BitacoraNueva() {
  const router = useRouter();
  const comunidadId = useCurrentComunidad();
  
  // Form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save draft
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || description || selectedType || selectedPriority) {
        saveDraft();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [title, description, selectedType, selectedPriority]);

  const saveDraft = () => {
    const draft = {
      type: selectedType,
      priority: selectedPriority,
      title,
      description,
      tags,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('bitacora_draft', JSON.stringify(draft));
  };

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('bitacora_draft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setSelectedType(parsedDraft.type || '');
      setSelectedPriority(parsedDraft.priority || '');
      setTitle(parsedDraft.title || '');
      setDescription(parsedDraft.description || '');
      setTags(parsedDraft.tags || []);
    }
  }, []);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !selectedPriority || !title.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!comunidadId) {
      setError('No se pudo determinar la comunidad actual');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const activityData: any = {
        type: selectedType,
        priority: selectedPriority,
        title: title.trim(),
      };

      if (description.trim()) {
        activityData.description = description.trim();
      }

      if (tags.length > 0) {
        activityData.tags = tags;
      }

      if (uploadedFiles.length > 0) {
        activityData.attachments = uploadedFiles;
      }

      await bitacoraService.createActivity(comunidadId, activityData);

      // Clear draft
      localStorage.removeItem('bitacora_draft');

      // Redirect to bitacora list
      router.push('/bitacora');
    } catch {
      setError('Error al crear la entrada de bitácora');
    } finally {
      setSaving(false);
    }
  };

  const activityTypes = [
    { type: 'system' as const },
    { type: 'user' as const },
    { type: 'security' as const },
    { type: 'maintenance' as const },
    { type: 'admin' as const },
    { type: 'financial' as const }
  ];

  const priorities = [
    { priority: 'low' as const },
    { priority: 'normal' as const },
    { priority: 'high' as const },
    { priority: 'critical' as const }
  ];

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Entrada de Bitácora — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Entrada de Bitácora'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Nueva Entrada de Bitácora</h1>
              <p className='text-muted mb-0'>Registra una nueva actividad en el sistema</p>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={saveDraft}
              >
                <i className='material-icons me-2'>save</i>
                Guardar Borrador
              </button>
              <button
                className='btn btn-secondary'
                onClick={() => router.push('/bitacora')}
              >
                <i className='material-icons me-2'>arrow_back</i>
                Volver
              </button>
            </div>
          </div>

          {error && (
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons me-2'>error</i>
              {error}
            </div>
          )}

          <div className='row'>
            <div className='col-lg-8'>
              <form onSubmit={handleSubmit}>
                {/* Activity Type Selection */}
                <div className='form-card mb-4'>
                  <div className='form-section'>
                    <div className='section-title'>
                      <i className='material-icons'>category</i>
                      <span>Tipo de Actividad *</span>
                    </div>
                    <div className='activity-type-grid row g-3'>
                      {activityTypes.map(({ type }) => (
                        <div key={type} className='col-md-4'>
                          <ActivityTypeCard
                            type={type}
                            selected={selectedType === type}
                            onSelect={handleTypeSelect}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority Selection */}
                <div className='form-card mb-4'>
                  <div className='form-section'>
                    <div className='section-title'>
                      <i className='material-icons'>flag</i>
                      <span>Prioridad *</span>
                    </div>
                    <div className='priority-options row g-3'>
                      {priorities.map(({ priority }) => (
                        <div key={priority} className='col-md-6'>
                          <PriorityOption
                            priority={priority}
                            selected={selectedPriority === priority}
                            onSelect={handlePrioritySelect}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Details */}
                <div className='form-card mb-4'>
                  <div className='form-section'>
                    <div className='section-title'>
                      <i className='material-icons'>edit</i>
                      <span>Detalles de la Actividad</span>
                    </div>
                    
                    <div className='mb-3'>
                      <label htmlFor='activityTitle' className='form-label'>
                        Título de la actividad *
                      </label>
                      <input
                        type='text'
                        className='form-control'
                        id='activityTitle'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Ej: Mantenimiento de ascensores completado'
                        required
                      />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='activityDescription' className='form-label'>
                        Descripción detallada
                      </label>
                      <div className='editor-toolbar'>
                        <button type='button' className='editor-btn' onClick={() => document.execCommand('bold')}>
                          <i className='material-icons'>format_bold</i>
                        </button>
                        <button type='button' className='editor-btn' onClick={() => document.execCommand('italic')}>
                          <i className='material-icons'>format_italic</i>
                        </button>
                        <button type='button' className='editor-btn' onClick={() => document.execCommand('underline')}>
                          <i className='material-icons'>format_underlined</i>
                        </button>
                        <div className='editor-divider'></div>
                        <button type='button' className='editor-btn' onClick={() => document.execCommand('insertUnorderedList')}>
                          <i className='material-icons'>format_list_bulleted</i>
                        </button>
                        <button type='button' className='editor-btn' onClick={() => document.execCommand('insertOrderedList')}>
                          <i className='material-icons'>format_list_numbered</i>
                        </button>
                      </div>
                      <div
                        className='editor-content'
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setDescription(e.currentTarget.textContent || '')}
                        style={{ minHeight: '120px' }}
                      >
                        {description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className='form-card mb-4'>
                  <div className='form-section'>
                    <div className='section-title'>
                      <i className='material-icons'>label</i>
                      <span>Etiquetas</span>
                    </div>
                    
                    <div className='tags-container' onClick={() => document.getElementById('tagInput')?.focus()}>
                      {tags.map((tag, index) => (
                        <span key={index} className='tag'>
                          #{tag}
                          <button
                            type='button'
                            className='remove-tag'
                            onClick={() => handleRemoveTag(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type='text'
                        id='tagInput'
                        className='tag-input'
                        placeholder={tags.length === 0 ? 'Agregar etiquetas...' : ''}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className='form-card mb-4'>
                  <div className='form-section'>
                    <div className='section-title'>
                      <i className='material-icons'>attach_file</i>
                      <span>Archivos Adjuntos</span>
                    </div>
                    
                    <div
                      className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className='upload-icon'>
                        <i className='material-icons'>cloud_upload</i>
                      </div>
                      <div className='upload-text'>
                        Arrastra archivos aquí o haz clic para seleccionar
                      </div>
                      <div className='upload-hint'>
                        Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Máx. 10MB)
                      </div>
                      <input
                        type='file'
                        multiple
                        className='d-none'
                        id='fileInput'
                        onChange={handleFileSelect}
                        accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                      />
                      <label htmlFor='fileInput' className='btn btn-outline-primary mt-3'>
                        <i className='material-icons me-2'>folder_open</i>
                        Seleccionar Archivos
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className='file-list mt-3'>
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className='file-item'>
                            <div className='file-info'>
                              <FileIcon fileName={file.name} size='md' />
                              <div className='file-details'>
                                <div className='file-name'>{file.name}</div>
                                <div className='file-size'>{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <div className='file-actions'>
                              <button
                                type='button'
                                className='file-action remove'
                                onClick={() => handleRemoveFile(file.id)}
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

                {/* Form Actions */}
                <div className='form-actions'>
                  <div className='d-flex justify-content-end gap-2'>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => router.push('/bitacora')}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <div className='btn-group'>
                      <button
                        type='button'
                        className='btn btn-outline-primary'
                        onClick={saveDraft}
                        disabled={saving}
                      >
                        <i className='material-icons me-2'>save</i>
                        Guardar Borrador
                      </button>
                      <button
                        type='submit'
                        className='btn btn-success'
                        disabled={saving || !selectedType || !selectedPriority || !title.trim()}
                      >
                        {saving ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className='material-icons me-2'>check</i>
                            Crear Entrada
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className='col-lg-4'>
              {/* Preview */}
              <div className='activity-preview card shadow-sm mb-4'>
                <div className='card-body'>
                  <div className='preview-header'>
                    <h6 className='card-title'>Vista Previa</h6>
                    <div className='preview-badges'>
                      {selectedType && <ActivityBadge type={selectedType as any} size='sm' />}
                      {selectedPriority && <PriorityBadge priority={selectedPriority as any} size='sm' />}
                    </div>
                  </div>
                  
                  <div className='preview-content'>
                    <div className='preview-title'>
                      {title || 'Título de la actividad'}
                    </div>
                    <div className='preview-description'>
                      {description || 'Descripción de la actividad...'}
                    </div>
                  </div>

                  <div className='preview-meta'>
                    <div className='preview-meta-item'>
                      <i className='material-icons me-1'>person</i>
                      Usuario Actual
                    </div>
                    <div className='preview-meta-item'>
                      <i className='material-icons me-1'>access_time</i>
                      {new Date().toLocaleDateString('es-CL')}
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className='preview-meta-item'>
                        <i className='material-icons me-1'>attach_file</i>
                        {uploadedFiles.length} archivo{uploadedFiles.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className='preview-tags mt-2'>
                      {tags.map((tag, index) => (
                        <span key={index} className='badge bg-light text-dark me-1'>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Help */}
              <div className='card shadow-sm'>
                <div className='card-body'>
                  <h6 className='card-title'>Ayuda</h6>
                  <div className='help-content'>
                    <div className='help-item mb-3'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>category</i>
                        Tipos de Actividad
                      </h6>
                      <p className='help-text text-muted small'>
                        Selecciona el tipo que mejor describa la actividad registrada.
                      </p>
                    </div>
                    <div className='help-item mb-3'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>flag</i>
                        Prioridades
                      </h6>
                      <p className='help-text text-muted small'>
                        Define la importancia y urgencia de la actividad registrada.
                      </p>
                    </div>
                    <div className='help-item'>
                      <h6 className='help-title'>
                        <i className='material-icons me-2'>save</i>
                        Auto-guardado
                      </h6>
                      <p className='help-text text-muted small'>
                        El borrador se guarda automáticamente cada 2 minutos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .form-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e9ecef;
          }

          .form-section {
            padding: 1.5rem;
            border-bottom: 1px solid #f8f9fa;
          }

          .form-section:last-child {
            border-bottom: none;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #212529;
            margin-bottom: 1rem;
          }

          .activity-type-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .priority-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }

          .editor-toolbar {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-bottom: none;
            border-radius: 0.375rem 0.375rem 0 0;
            padding: 0.5rem;
            display: flex;
            gap: 0.25rem;
          }

          .editor-btn {
            background: none;
            border: none;
            padding: 0.5rem;
            border-radius: 0.25rem;
            color: #6c757d;
            cursor: pointer;
            transition: all 0.2s;
          }

          .editor-btn:hover {
            background: #e9ecef;
            color: #495057;
          }

          .editor-content {
            border: 1px solid #e9ecef;
            border-radius: 0 0 0.375rem 0.375rem;
            padding: 0.75rem;
            min-height: 120px;
            background: #fff;
            outline: none;
          }

          .editor-content:focus {
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .tags-container {
            border: 1px solid #e9ecef;
            border-radius: 0.375rem;
            padding: 0.5rem;
            min-height: 2.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
            cursor: text;
          }

          .tags-container:focus-within {
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .tag {
            background: #007bff;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .remove-tag {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
          }

          .remove-tag:hover {
            color: #ccc;
          }

          .tag-input {
            border: none;
            outline: none;
            flex: 1;
            min-width: 120px;
            background: transparent;
          }

          .file-upload-area {
            border: 2px dashed #e9ecef;
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .file-upload-area:hover {
            border-color: #007bff;
            background: rgba(0, 123, 255, 0.05);
          }

          .file-upload-area.dragover {
            border-color: #007bff;
            background: rgba(0, 123, 255, 0.1);
            transform: scale(1.02);
          }

          .upload-icon {
            font-size: 3rem;
            color: #6c757d;
            margin-bottom: 1rem;
          }

          .upload-text {
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
          }

          .upload-hint {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .file-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #e9ecef;
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
            background: #f8f9fa;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .file-details {
            flex: 1;
          }

          .file-name {
            font-weight: 500;
            color: #212529;
            margin-bottom: 0.25rem;
          }

          .file-size {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .file-actions {
            display: flex;
            gap: 0.5rem;
          }

          .file-action {
            background: none;
            border: none;
            padding: 0.5rem;
            border-radius: 0.25rem;
            color: #6c757d;
            cursor: pointer;
            transition: all 0.2s;
          }

          .file-action:hover {
            background: #e9ecef;
            color: #495057;
          }

          .file-action.remove:hover {
            color: #dc3545;
          }

          .form-actions {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 0 0 0.5rem 0.5rem;
            margin-top: 2rem;
            border: 1px solid #e9ecef;
          }

          .activity-preview {
            position: sticky;
            top: 1rem;
          }

          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .preview-badges {
            display: flex;
            gap: 0.5rem;
          }

          .preview-content {
            margin-bottom: 1rem;
          }

          .preview-title {
            font-weight: 600;
            color: #212529;
            margin-bottom: 0.5rem;
          }

          .preview-description {
            color: #6c757d;
            line-height: 1.5;
          }

          .preview-meta {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6c757d;
          }

          .preview-meta-item {
            display: flex;
            align-items: center;
          }

          @media (max-width: 768px) {
            .activity-type-grid,
            .priority-options {
              grid-template-columns: 1fr;
            }

            .form-actions {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              margin: 0;
              border-radius: 0;
              z-index: 1000;
            }

            .activity-preview {
              position: static;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
