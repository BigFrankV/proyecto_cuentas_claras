import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import {
  CategoryBadge,
  AccessBadge,
  FileIcon,
  VersionBadge,
  DocumentCard,
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
}

export default function DocumentosListado() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Reglamento de Copropiedad',
        description:
          'Documento oficial con las normas y reglamentos de la copropiedad',
        category: 'legal',
        access: 'public',
        fileName: 'reglamento-copropiedad.pdf',
        fileSize: '2.5 MB',
        version: '2.1',
        isLatest: true,
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-15T10:30:00Z',
        tags: ['reglamento', 'normas', 'oficial'],
      },
      {
        id: '2',
        name: 'Estados Financieros Enero 2024',
        description: 'Resumen financiero del mes de enero 2024',
        category: 'financial',
        access: 'owners',
        fileName: 'estados-financieros-ene-2024.xlsx',
        fileSize: '856 KB',
        version: '1.0',
        isLatest: true,
        uploadedBy: 'Contabilidad',
        uploadedAt: '2024-02-01T09:15:00Z',
        tags: ['financiero', 'enero', 'estados'],
      },
      {
        id: '3',
        name: 'Manual de Mantenimiento Ascensores',
        description:
          'Guía técnica para el mantenimiento de los ascensores del edificio',
        category: 'technical',
        access: 'admin',
        fileName: 'manual-mantenimiento-ascensores.pdf',
        fileSize: '4.2 MB',
        version: '1.3',
        isLatest: false,
        uploadedBy: 'Técnico',
        uploadedAt: '2024-01-20T14:45:00Z',
        tags: ['mantenimiento', 'técnico', 'ascensores'],
      },
      {
        id: '4',
        name: 'Acta Asamblea Extraordinaria',
        description: 'Acta de la asamblea extraordinaria del 25 de enero 2024',
        category: 'meeting',
        access: 'residents',
        fileName: 'acta-asamblea-25-ene-2024.doc',
        fileSize: '124 KB',
        version: '1.0',
        isLatest: true,
        uploadedBy: 'Secretaria',
        uploadedAt: '2024-01-26T16:20:00Z',
        tags: ['acta', 'asamblea', 'reunión'],
      },
      {
        id: '5',
        name: 'Presupuesto Anual 2024',
        description: 'Presupuesto aprobado para el año 2024',
        category: 'financial',
        access: 'owners',
        fileName: 'presupuesto-2024.xlsx',
        fileSize: '1.2 MB',
        version: '2.0',
        isLatest: true,
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-10T11:00:00Z',
        tags: ['presupuesto', '2024', 'aprobado'],
      },
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 800);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesAccess =
      selectedAccess === 'all' || doc.access === selectedAccess;

    return matchesSearch && matchesCategory && matchesAccess;
  });

  const handleDocumentAction = (action: string, id: string) => {
    switch (action) {
      case 'view':
        router.push(`/documentos/${id}`);
        break;
      case 'download':
        // Mock download
        alert(`Descargando documento ${id}`);
        break;
      case 'edit':
        router.push(`/documentos/${id}/editar`);
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          alert('Documento eliminado exitosamente');
        }
        break;
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedDocuments.length === 0) {
      alert('Selecciona al menos un documento');
      return;
    }

    switch (action) {
      case 'download':
        alert(`Descargando ${selectedDocuments.length} documentos`);
        break;
      case 'delete':
        if (
          confirm(
            `¿Estás seguro de que deseas eliminar ${selectedDocuments.length} documentos?`,
          )
        ) {
          setDocuments(prev =>
            prev.filter(doc => !selectedDocuments.includes(doc.id)),
          );
          setSelectedDocuments([]);
          alert('Documentos eliminados exitosamente');
        }
        break;
      case 'export':
        alert(
          `Exportando información de ${selectedDocuments.length} documentos`,
        );
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = [
    {
      id: 'all',
      name: 'Todas las categorías',
      icon: 'folder',
      count: documents.length,
    },
    {
      id: 'legal',
      name: 'Legal',
      icon: 'gavel',
      count: documents.filter(d => d.category === 'legal').length,
    },
    {
      id: 'financial',
      name: 'Financiero',
      icon: 'attach_money',
      count: documents.filter(d => d.category === 'financial').length,
    },
    {
      id: 'technical',
      name: 'Técnico',
      icon: 'build',
      count: documents.filter(d => d.category === 'technical').length,
    },
    {
      id: 'administrative',
      name: 'Administrativo',
      icon: 'business',
      count: documents.filter(d => d.category === 'administrative').length,
    },
    {
      id: 'maintenance',
      name: 'Mantenimiento',
      icon: 'handyman',
      count: documents.filter(d => d.category === 'maintenance').length,
    },
    {
      id: 'meeting',
      name: 'Reuniones',
      icon: 'groups',
      count: documents.filter(d => d.category === 'meeting').length,
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Documentos'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando documentos...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Documentos — Cuentas Claras</title>
      </Head>

      <Layout title='Documentos'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Documentos</h1>
              <p className='text-muted mb-0'>
                Gestiona todos los documentos de la copropiedad
              </p>
            </div>
            <div className='d-flex gap-2'>
              <Link
                href='/documentos/nuevo'
                className='btn btn-outline-primary'
              >
                <i className='material-icons me-2'>upload</i>
                Subir Documento
              </Link>
              <Link href='/documentos-compra' className='btn btn-primary'>
                <i className='material-icons me-2'>add</i>
                Documento Compra
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className='row g-3 mb-4'>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-primary text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>folder</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {documents.length}
                    </div>
                    <div className='stats-label text-muted small'>
                      Total Documentos
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-success text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>public</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {documents.filter(d => d.access === 'public').length}
                    </div>
                    <div className='stats-label text-muted small'>Públicos</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-warning text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>vpn_key</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {documents.filter(d => d.access === 'owners').length}
                    </div>
                    <div className='stats-label text-muted small'>
                      Solo Propietarios
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-info text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>update</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {documents.filter(d => d.isLatest).length}
                    </div>
                    <div className='stats-label text-muted small'>
                      Versiones Actuales
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='filters-card card border-0 shadow-sm mb-4'>
            <div className='card-body'>
              <div className='filters-row row g-3 align-items-end'>
                <div className='col-lg-6'>
                  <label className='form-label'>Buscar documentos</label>
                  <div className='search-box position-relative'>
                    <i className='material-icons position-absolute start-0 top-50 translate-middle-y ms-3 text-muted'>
                      search
                    </i>
                    <input
                      type='text'
                      className='form-control ps-5'
                      placeholder='Buscar por nombre, descripción o etiquetas...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='col-lg-3'>
                  <label className='form-label'>Nivel de acceso</label>
                  <select
                    className='form-select'
                    value={selectedAccess}
                    onChange={e => setSelectedAccess(e.target.value)}
                  >
                    <option value='all'>Todos los niveles</option>
                    <option value='public'>Público</option>
                    <option value='residents'>Residentes</option>
                    <option value='owners'>Propietarios</option>
                    <option value='admin'>Administración</option>
                  </select>
                </div>

                <div className='col-lg-3'>
                  <div className='d-flex gap-2'>
                    <button
                      className='btn btn-outline-secondary'
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedAccess('all');
                      }}
                    >
                      <i className='material-icons me-2'>clear</i>
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Filter - Masonry Style */}
              <div className='mt-4'>
                <label className='form-label mb-3'>Filtrar por categoría</label>
                <div className='d-flex flex-wrap gap-2'>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`btn category-filter-btn d-flex align-items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '16px' }}
                      >
                        {category.icon}
                      </i>
                      {category.name}
                      <span
                        className={`badge rounded-pill ms-1 ${
                          selectedCategory === category.id
                            ? 'bg-light text-primary'
                            : 'bg-light text-dark'
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3 gap-3'>
            <div className='results-summary'>
              <strong>{filteredDocuments.length}</strong> documentos encontrados
              {searchTerm && (
                <span className='text-muted'>
                  {' '}
                  para &quot;{searchTerm}&quot;
                </span>
              )}
            </div>

            <div className='d-flex gap-2 align-items-center'>
              {/* Bulk actions */}
              {selectedDocuments.length > 0 && (
                <div className='bulk-actions d-flex gap-2 me-3'>
                  <span className='text-muted small'>
                    {selectedDocuments.length} seleccionados
                  </span>
                  <div className='btn-group'>
                    <button
                      className='btn btn-sm btn-outline-primary'
                      onClick={() => handleBulkAction('download')}
                    >
                      <i className='material-icons me-1'>download</i>
                      Descargar
                    </button>
                    <button
                      className='btn btn-sm btn-outline-secondary'
                      onClick={() => handleBulkAction('export')}
                    >
                      <i className='material-icons me-1'>file_download</i>
                      Exportar
                    </button>
                    <button
                      className='btn btn-sm btn-outline-danger'
                      onClick={() => handleBulkAction('delete')}
                    >
                      <i className='material-icons me-1'>delete</i>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* View toggle */}
              <div className='view-toggle btn-group' role='group'>
                <button
                  type='button'
                  className={`btn btn-outline-secondary ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  <i className='material-icons'>grid_view</i>
                </button>
                <button
                  type='button'
                  className={`btn btn-outline-secondary ${view === 'table' ? 'active' : ''}`}
                  onClick={() => setView('table')}
                >
                  <i className='material-icons'>view_list</i>
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid View */}
          {view === 'grid' && (
            <div className='row g-3'>
              {filteredDocuments.map(document => (
                <div key={document.id} className='col-sm-6 col-lg-4 col-xl-3'>
                  <DocumentCard
                    document={document}
                    onView={id => handleDocumentAction('view', id)}
                    onDownload={id => handleDocumentAction('download', id)}
                    onEdit={id => handleDocumentAction('edit', id)}
                    onDelete={id => handleDocumentAction('delete', id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Documents Table View */}
          {view === 'table' && (
            <div className='card border-0 shadow-sm'>
              <div className='table-responsive'>
                <table className='table table-hover document-table mb-0'>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type='checkbox'
                          className='form-check-input'
                          checked={
                            selectedDocuments.length ===
                              filteredDocuments.length &&
                            filteredDocuments.length > 0
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Documento</th>
                      <th>Categoría</th>
                      <th>Acceso</th>
                      <th>Versión</th>
                      <th>Subido por</th>
                      <th>Fecha</th>
                      <th style={{ width: '100px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(document => (
                      <tr key={document.id}>
                        <td>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            checked={selectedDocuments.includes(document.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDocuments(prev => [
                                  ...prev,
                                  document.id,
                                ]);
                              } else {
                                setSelectedDocuments(prev =>
                                  prev.filter(id => id !== document.id),
                                );
                              }
                            }}
                          />
                        </td>
                        <td>
                          <div className='d-flex align-items-center'>
                            <FileIcon fileName={document.fileName} size='sm' />
                            <div className='ms-3'>
                              <div className='fw-medium'>{document.name}</div>
                              <div className='text-muted small'>
                                {document.fileName} ({document.fileSize})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <CategoryBadge
                            category={document.category}
                            size='sm'
                          />
                        </td>
                        <td>
                          <AccessBadge access={document.access} size='sm' />
                        </td>
                        <td>
                          <VersionBadge
                            version={document.version}
                            isLatest={document.isLatest}
                            size='sm'
                          />
                        </td>
                        <td className='text-muted'>{document.uploadedBy}</td>
                        <td className='text-muted'>
                          {formatDate(document.uploadedAt)}
                        </td>
                        <td>
                          <div className='dropdown'>
                            <button
                              className='btn btn-sm btn-outline-secondary dropdown-toggle'
                              type='button'
                              data-bs-toggle='dropdown'
                            >
                              <i className='material-icons'>more_vert</i>
                            </button>
                            <ul className='dropdown-menu dropdown-menu-end'>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleDocumentAction('view', document.id)
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    visibility
                                  </i>
                                  Ver
                                </button>
                              </li>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleDocumentAction(
                                      'download',
                                      document.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    download
                                  </i>
                                  Descargar
                                </button>
                              </li>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleDocumentAction('edit', document.id)
                                  }
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
                                  onClick={() =>
                                    handleDocumentAction('delete', document.id)
                                  }
                                >
                                  <i className='material-icons me-2'>delete</i>
                                  Eliminar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredDocuments.length === 0 && (
            <div className='text-center py-5'>
              <i
                className='material-icons mb-3 text-muted'
                style={{ fontSize: '4rem' }}
              >
                folder_open
              </i>
              <h5 className='text-muted'>No se encontraron documentos</h5>
              <p className='text-muted'>
                {searchTerm
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Comienza subiendo tu primer documento'}
              </p>
              {!searchTerm && (
                <Link href='/documentos/nuevo' className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Subir Documento
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
