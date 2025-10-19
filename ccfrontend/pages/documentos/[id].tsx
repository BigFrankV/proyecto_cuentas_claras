import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import {
  CategoryBadge,
  AccessBadge,
  FileIcon,
  VersionBadge,
} from '@/components/documentos';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

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
  url?: string;
  notes?: string;
  downloadCount?: number;
  lastDownloaded?: string;
}

interface DocumentVersion {
  id: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  isLatest: boolean;
  changes?: string;
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  date: string;
}

export default function DocumentoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    // Mock data
    setTimeout(() => {
      const mockDocument: Document = {
        id: id as string,
        name:
          id === '1'
            ? 'Reglamento de Copropiedad'
            : 'Acta Asamblea Extraordinaria',
        description:
          id === '1'
            ? 'Documento oficial con las normas y reglamentos de la copropiedad'
            : 'Acta de la asamblea extraordinaria del 25 de enero 2024',
        category: id === '1' ? 'legal' : 'meeting',
        access: id === '1' ? 'public' : 'residents',
        fileName:
          id === '1'
            ? 'reglamento-copropiedad.pdf'
            : 'acta-asamblea-25-ene-2024.doc',
        fileSize: id === '1' ? '2.5 MB' : '124 KB',
        version: id === '1' ? '2.1' : '1.0',
        isLatest: true,
        uploadedBy: id === '1' ? 'Admin' : 'Secretaria',
        uploadedAt:
          id === '1' ? '2024-01-15T10:30:00Z' : '2024-01-26T16:20:00Z',
        tags:
          id === '1'
            ? ['reglamento', 'normas', 'oficial']
            : ['acta', 'asamblea', 'reunión'],
        url: '#',
        notes:
          id === '1'
            ? 'Documento actualizado con las últimas modificaciones aprobadas en asamblea extraordinaria'
            : 'Acta oficial de la asamblea extraordinaria convocada para tratar temas urgentes',
        downloadCount: id === '1' ? 45 : 12,
        lastDownloaded: '2024-01-20T14:30:00Z',
      };

      const mockVersions: DocumentVersion[] =
        id === '1'
          ? [
            {
              id: '3',
              version: '2.1',
              uploadedBy: 'Admin',
              uploadedAt: '2024-01-15T10:30:00Z',
              isLatest: true,
              changes:
                  'Actualización de normas de convivencia y uso de espacios comunes',
            },
            {
              id: '2',
              version: '2.0',
              uploadedBy: 'Admin',
              uploadedAt: '2023-12-10T09:15:00Z',
              isLatest: false,
              changes: 'Incorporación de nuevas regulaciones sobre mascotas',
            },
            {
              id: '1',
              version: '1.0',
              uploadedBy: 'Admin',
              uploadedAt: '2023-06-01T08:00:00Z',
              isLatest: false,
              changes: 'Versión inicial del reglamento',
            },
          ]
          : [
            {
              id: '1',
              version: '1.0',
              uploadedBy: 'Secretaria',
              uploadedAt: '2024-01-26T16:20:00Z',
              isLatest: true,
              changes: 'Acta original de la asamblea',
            },
          ];

      const mockComments: Comment[] = [
        {
          id: '1',
          user: 'Juan Pérez',
          avatar: 'JP',
          content:
            'Documento muy útil. ¿Cuándo estará disponible la próxima actualización?',
          date: '2024-01-18T10:30:00Z',
        },
        {
          id: '2',
          user: 'María García',
          avatar: 'MG',
          content: 'Excelente trabajo en la organización del contenido.',
          date: '2024-01-19T14:15:00Z',
        },
      ];

      setDocument(mockDocument);
      setVersions(mockVersions);
      setComments(mockComments);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleDownload = () => {
    if (!document) {
      return;
    }

    // Mock download
    setDocument(prev =>
      prev
        ? {
          ...prev,
          downloadCount: (prev.downloadCount || 0) + 1,
          lastDownloaded: new Date().toISOString(),
        }
        : null,
    );

    alert(`Descargando ${document.fileName}`);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'Usuario Actual',
      avatar: 'UC',
      content: newComment,
      date: new Date().toISOString(),
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Documento'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
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
              <p className='text-muted'>
                El documento que buscas no existe o ha sido eliminado.
              </p>
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
        <title>{document.name} — Documentos — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Documento'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/documentos' className='text-decoration-none'>
                  Documentos
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                {document.name}
              </li>
            </ol>
          </nav>

          {/* Document Header */}
          <div className='document-header card shadow-sm mb-4'>
            <div className='card-body'>
              <div className='row align-items-center'>
                <div className='col-lg-8'>
                  <div className='d-flex align-items-center mb-3'>
                    <FileIcon fileName={document.fileName} size='lg' />
                    <div className='ms-3'>
                      <div className='d-flex align-items-center gap-2 mb-2'>
                        <CategoryBadge category={document.category} size='md' />
                        <AccessBadge access={document.access} size='md' />
                        <VersionBadge
                          version={document.version}
                          isLatest={document.isLatest}
                          size='md'
                        />
                      </div>
                      <h1 className='h3 mb-2'>{document.name}</h1>
                      <p className='text-muted mb-0'>{document.description}</p>
                    </div>
                  </div>

                  <div className='document-meta row text-muted'>
                    <div className='col-md-6'>
                      <p className='mb-1'>
                        <i
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          insert_drive_file
                        </i>
                        {document.fileName} ({document.fileSize})
                      </p>
                      <p className='mb-1'>
                        <i
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          person
                        </i>
                        Subido por: {document.uploadedBy}
                      </p>
                      <p className='mb-1'>
                        <i
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          access_time
                        </i>
                        {formatDate(document.uploadedAt)}
                      </p>
                    </div>
                    <div className='col-md-6'>
                      <p className='mb-1'>
                        <i
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          download
                        </i>
                        Descargas: {document.downloadCount || 0}
                      </p>
                      {document.lastDownloaded && (
                        <p className='mb-1'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            schedule
                          </i>
                          Última descarga: {formatDate(document.lastDownloaded)}
                        </p>
                      )}
                      <div className='d-flex flex-wrap gap-1 mt-2'>
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='badge bg-light text-dark'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-4 text-lg-end'>
                  <div className='d-flex flex-column gap-2'>
                    <button
                      className='btn btn-primary'
                      onClick={handleDownload}
                    >
                      <i className='material-icons me-2'>download</i>
                      Descargar
                    </button>
                    <Link
                      href={`/documentos/${document.id}/editar`}
                      className='btn btn-outline-secondary'
                    >
                      <i className='material-icons me-2'>edit</i>
                      Editar
                    </Link>
                    <div className='dropdown'>
                      <button
                        className='btn btn-outline-secondary dropdown-toggle'
                        type='button'
                        data-bs-toggle='dropdown'
                      >
                        <i className='material-icons me-2'>more_vert</i>
                        Más acciones
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end'>
                        <li>
                          <button className='dropdown-item'>
                            <i className='material-icons me-2'>share</i>
                            Compartir
                          </button>
                        </li>
                        <li>
                          <button className='dropdown-item'>
                            <i className='material-icons me-2'>print</i>
                            Imprimir
                          </button>
                        </li>
                        <li>
                          <button className='dropdown-item'>
                            <i className='material-icons me-2'>file_copy</i>
                            Duplicar
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button className='dropdown-item text-danger'>
                            <i className='material-icons me-2'>delete</i>
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8'>
              {/* Tabs */}
              <div className='document-tabs card shadow-sm mb-4'>
                <div className='card-body'>
                  <ul className='nav nav-tabs' role='tablist'>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                      >
                        <i className='material-icons me-2'>description</i>
                        Información
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'versions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('versions')}
                      >
                        <i className='material-icons me-2'>history</i>
                        Versiones ({versions.length})
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                      >
                        <i className='material-icons me-2'>comment</i>
                        Comentarios ({comments.length})
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>
                      Información del Documento
                    </h5>

                    {document.notes && (
                      <div className='mb-4'>
                        <h6>Notas</h6>
                        <p className='text-muted'>{document.notes}</p>
                      </div>
                    )}

                    <div className='document-preview bg-light rounded p-4 text-center'>
                      <FileIcon fileName={document.fileName} size='lg' />
                      <h6 className='mt-3 mb-2'>{document.fileName}</h6>
                      <p className='text-muted mb-3'>
                        Tamaño: {document.fileSize}
                      </p>
                      <button
                        className='btn btn-primary'
                        onClick={handleDownload}
                      >
                        <i className='material-icons me-2'>visibility</i>
                        Ver Documento
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Versions Tab */}
              {activeTab === 'versions' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Historial de Versiones</h5>

                    <div className='versions-list'>
                      {versions.map(version => (
                        <div
                          key={version.id}
                          className='version-item d-flex align-items-start p-3 border rounded mb-3'
                        >
                          <div className='version-icon me-3'>
                            <VersionBadge
                              version={version.version}
                              isLatest={version.isLatest}
                              size='md'
                            />
                          </div>
                          <div className='version-content flex-grow-1'>
                            <div className='version-header d-flex justify-content-between align-items-start mb-2'>
                              <div>
                                <h6 className='version-title mb-1'>
                                  Versión {version.version}
                                </h6>
                                {version.changes && (
                                  <p className='version-changes text-muted mb-0'>
                                    {version.changes}
                                  </p>
                                )}
                              </div>
                              <div className='version-date text-muted small'>
                                {formatDate(version.uploadedAt)}
                              </div>
                            </div>
                            <div className='version-footer text-muted small d-flex justify-content-between align-items-center'>
                              <span>Por: {version.uploadedBy}</span>
                              {!version.isLatest && (
                                <button className='btn btn-sm btn-outline-primary'>
                                  <i className='material-icons me-1'>restore</i>
                                  Restaurar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Comentarios</h5>

                    {/* Add Comment */}
                    <div className='add-comment mb-4'>
                      <div className='d-flex'>
                        <div
                          className='avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3'
                          style={{
                            width: '40px',
                            height: '40px',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                        >
                          UC
                        </div>
                        <div className='flex-grow-1'>
                          <textarea
                            className='form-control mb-2'
                            rows={3}
                            placeholder='Agregar un comentario...'
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                          ></textarea>
                          <button
                            className='btn btn-primary'
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                          >
                            <i className='material-icons me-2'>send</i>
                            Comentar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <div className='comments-list'>
                        {comments.map(comment => (
                          <div
                            key={comment.id}
                            className='comment-item d-flex mb-4'
                          >
                            <div
                              className='avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3'
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              {comment.avatar}
                            </div>
                            <div className='comment-content flex-grow-1'>
                              <div className='comment-header d-flex justify-content-between align-items-center mb-2'>
                                <div className='comment-author fw-medium'>
                                  {comment.user}
                                </div>
                                <div className='comment-date text-muted small'>
                                  {formatDate(comment.date)}
                                </div>
                              </div>
                              <div className='comment-text'>
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-4'>
                        <i
                          className='material-icons mb-2 text-muted'
                          style={{ fontSize: '3rem' }}
                        >
                          comment
                        </i>
                        <p className='text-muted'>No hay comentarios aún</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className='col-lg-4'>
              {/* Quick Actions */}
              <div className='card shadow-sm mb-4'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Acciones Rápidas</h6>
                  <div className='d-grid gap-2'>
                    <button
                      className='btn btn-outline-primary'
                      onClick={handleDownload}
                    >
                      <i className='material-icons me-2'>download</i>
                      Descargar
                    </button>
                    <Link
                      href={`/documentos/${document.id}/editar`}
                      className='btn btn-outline-secondary'
                    >
                      <i className='material-icons me-2'>edit</i>
                      Editar
                    </Link>
                    <button className='btn btn-outline-info'>
                      <i className='material-icons me-2'>share</i>
                      Compartir
                    </button>
                    <button className='btn btn-outline-success'>
                      <i className='material-icons me-2'>print</i>
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Stats */}
              <div className='card shadow-sm mb-4'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Estadísticas</h6>
                  <div className='stats-list'>
                    <div className='stat-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Descargas:</span>
                      <span className='fw-medium'>
                        {document.downloadCount || 0}
                      </span>
                    </div>
                    <div className='stat-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Versiones:</span>
                      <span className='fw-medium'>{versions.length}</span>
                    </div>
                    <div className='stat-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Comentarios:</span>
                      <span className='fw-medium'>{comments.length}</span>
                    </div>
                    <div className='stat-item d-flex justify-content-between'>
                      <span className='text-muted'>Tamaño:</span>
                      <span className='fw-medium'>{document.fileSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Documents */}
              <div className='card shadow-sm'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Documentos Relacionados</h6>
                  <div className='related-docs'>
                    <div className='related-doc-item d-flex align-items-center mb-3'>
                      <FileIcon fileName='manual-convivencia.pdf' size='sm' />
                      <div className='ms-2 flex-grow-1'>
                        <div className='related-doc-name small fw-medium'>
                          Manual de Convivencia
                        </div>
                        <div className='related-doc-category text-muted small'>
                          Legal
                        </div>
                      </div>
                    </div>
                    <div className='related-doc-item d-flex align-items-center'>
                      <FileIcon fileName='estatutos.pdf' size='sm' />
                      <div className='ms-2 flex-grow-1'>
                        <div className='related-doc-name small fw-medium'>
                          Estatutos de la Copropiedad
                        </div>
                        <div className='related-doc-category text-muted small'>
                          Legal
                        </div>
                      </div>
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
