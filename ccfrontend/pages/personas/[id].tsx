import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: 'Propietario' | 'Inquilino' | 'Administrador';
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
  ultimoAcceso: string;
  usuario: string;
  nivelAcceso: string;
  avatar?: string;
  unidades: UnidadAsociada[];
}

interface UnidadAsociada {
  id: string;
  nombre: string;
  edificio: string;
  comunidad: string;
  direccion: string;
  metrosCuadrados: number;
  estado: string;
  saldoPendiente: number;
  relacion: 'Propietario' | 'Inquilino';
}

interface Pago {
  id: string;
  fecha: string;
  unidad: string;
  periodo: string;
  importe: number;
  metodo: string;
  estado: string;
}

interface Actividad {
  fecha: string;
  titulo: string;
  descripcion: string;
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  tamaño: string;
  icono: string;
}

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  autor: string;
}

// Mock data - en una app real vendría de una API
const mockPersona: Persona = {
  id: '1',
  nombre: 'Juan',
  apellido: 'Delgado',
  dni: '30.457.892',
  email: 'juan.delgado@email.com',
  telefono: '+54 11 5555-1234',
  direccion: 'Av. Libertador 1234, CABA',
  tipo: 'Propietario',
  estado: 'Activo',
  fechaRegistro: '10/01/2022',
  ultimoAcceso: '12/05/2023 15:30',
  usuario: 'juandelgado',
  nivelAcceso: 'Usuario estándar',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  unidades: [
    {
      id: '1',
      nombre: 'Departamento 4B',
      edificio: 'Torre Norte',
      comunidad: 'Parque Real',
      direccion: 'Av. Libertador 1234, Piso 4, Dpto B',
      metrosCuadrados: 85,
      estado: 'Activo',
      saldoPendiente: 0,
      relacion: 'Propietario'
    },
    {
      id: '2',
      nombre: 'Departamento 7A',
      edificio: 'Torre Sur',
      comunidad: 'Parque Real',
      direccion: 'Av. Libertador 1234, Piso 7, Dpto A',
      metrosCuadrados: 95,
      estado: 'Activo',
      saldoPendiente: 0,
      relacion: 'Propietario'
    }
  ]
};

const mockPagos: Pago[] = [
  {
    id: 'P-2023-0456',
    fecha: '15/05/2023',
    unidad: 'Dpto 4B',
    periodo: 'Mayo 2023',
    importe: 45000,
    metodo: 'Transferencia',
    estado: 'Pagado'
  },
  {
    id: 'P-2023-0398',
    fecha: '15/05/2023',
    unidad: 'Dpto 7A',
    periodo: 'Mayo 2023',
    importe: 52000,
    metodo: 'Transferencia',
    estado: 'Pagado'
  }
];

const mockActividades: Actividad[] = [
  {
    fecha: 'Hoy, 10:30 AM',
    titulo: 'Inicio de sesión',
    descripcion: 'El usuario inició sesión en el sistema'
  },
  {
    fecha: '15/05/2023, 15:45',
    titulo: 'Pago registrado',
    descripcion: 'Se registró el pago de expensas para Dpto 4B por $45.000'
  }
];

const mockDocumentos: Documento[] = [
  {
    id: '1',
    nombre: 'Contrato Compraventa.pdf',
    tipo: 'Contrato',
    fecha: '10/01/2022',
    tamaño: '2.4 MB',
    icono: 'picture_as_pdf'
  },
  {
    id: '2',
    nombre: 'Foto DNI.jpg',
    tipo: 'Identificación',
    fecha: '10/01/2022',
    tamaño: '1.2 MB',
    icono: 'image'
  }
];

const mockNotas: Nota[] = [
  {
    id: '1',
    titulo: 'Actualización de contacto',
    contenido: 'El propietario confirmó su nuevo número de teléfono: +54 11 5555-1234. Actualizar en todos los sistemas.',
    fecha: '12/05/2023',
    autor: 'Patricia Contreras'
  },
  {
    id: '2',
    titulo: 'Recordatorio pago',
    contenido: 'Recordar contactar a principios de junio para confirmar pago. Prefiere realizar transferencia temprano en el mes.',
    fecha: '15/03/2023',
    autor: 'Carlos Ramírez'
  }
];

export default function PersonaDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('unidades');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Propietario':
        return 'bg-success';
      case 'Inquilino':
        return 'bg-info';
      case 'Administrador':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    return estado === 'Activo' ? 'bg-success' : 'bg-secondary';
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Detalle de Persona — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Persona'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <Link href='/personas' className='btn btn-link text-secondary p-0 me-3'>
                <i className='material-icons'>arrow_back</i>
              </Link>
              <h1 className='h3 mb-0'>Detalle de Persona</h1>
            </div>
            <div className='d-flex align-items-center'>
              <div className='dropdown me-2'>
                <button className='btn btn-outline-secondary dropdown-toggle' type='button' data-bs-toggle='dropdown'>
                  <i className='material-icons me-1' style={{ fontSize: '16px' }}>more_vert</i>
                  Acciones
                </button>
                <ul className='dropdown-menu'>
                  <li><a className='dropdown-item' href='#'><i className='material-icons me-2' style={{ fontSize: '16px' }}>email</i>Enviar email</a></li>
                  <li><a className='dropdown-item' href='#'><i className='material-icons me-2' style={{ fontSize: '16px' }}>vpn_key</i>Restablecer acceso</a></li>
                  <li><hr className='dropdown-divider' /></li>
                  <li><a className='dropdown-item text-danger' href='#'><i className='material-icons me-2' style={{ fontSize: '16px' }}>block</i>Desactivar</a></li>
                </ul>
              </div>
              <button className='btn btn-primary'>
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>edit</i>
                Editar
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className='card shadow-sm mb-4' style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <div className='card-body py-4'>
              <div className='row align-items-center'>
                <div className='col-auto'>
                  {mockPersona.avatar ? (
                    <img 
                      src={mockPersona.avatar} 
                      alt='Foto de perfil' 
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid rgba(255,255,255,0.3)'
                      }}
                    />
                  ) : (
                    <div 
                      className='d-flex align-items-center justify-content-center bg-white text-primary'
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        fontSize: '32px',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(mockPersona.nombre, mockPersona.apellido)}
                    </div>
                  )}
                </div>
                <div className='col'>
                  <h3 className='mb-2'>{mockPersona.nombre} {mockPersona.apellido}</h3>
                  <div className='d-flex align-items-center mb-2'>
                    <span className={`badge ${getTipoBadgeClass(mockPersona.tipo)} me-2`}>
                      {mockPersona.tipo}
                    </span>
                    <span className='small'>DNI: {mockPersona.dni}</span>
                  </div>
                  <div className='d-flex align-items-center'>
                    <i className='material-icons me-2' style={{ fontSize: '18px' }}>email</i>
                    <span className='small me-4'>{mockPersona.email}</span>
                    <i className='material-icons me-2' style={{ fontSize: '18px' }}>phone</i>
                    <span className='small'>{mockPersona.telefono}</span>
                  </div>
                </div>
                <div className='col-auto'>
                  <span className={`badge ${getEstadoBadgeClass(mockPersona.estado)} fs-6`}>
                    {mockPersona.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='row'>
            {/* Sidebar */}
            <div className='col-12 col-lg-4'>
              {/* Resumen */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent'>
                  <h6 className='mb-0'>Resumen</h6>
                </div>
                <div className='card-body'>
                  <div className='row g-3'>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Unidades</div>
                        <div className='h4 mb-0'>{mockPersona.unidades.length}</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Saldo Total</div>
                        <div className='h4 mb-0 text-success'>{formatCurrency(0)}</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Último Pago</div>
                        <div className='fw-medium'>15/05/2023</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='text-center'>
                        <div className='text-muted small'>Fecha Alta</div>
                        <div className='fw-medium'>{mockPersona.fechaRegistro}</div>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='text-center'>
                        <div className='text-muted small'>Dirección</div>
                        <div className='fw-medium'>{mockPersona.direccion}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Cuenta */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                  <h6 className='mb-0'>Información de Cuenta</h6>
                  <button className='btn btn-sm btn-outline-primary'>Editar</button>
                </div>
                <div className='card-body'>
                  <div className='mb-3'>
                    <div className='text-muted small'>Usuario</div>
                    <div className='fw-medium'>{mockPersona.usuario}</div>
                  </div>
                  <div className='mb-3'>
                    <div className='text-muted small'>Nivel de acceso</div>
                    <div className='fw-medium'>{mockPersona.nivelAcceso}</div>
                  </div>
                  <div className='mb-3'>
                    <div className='text-muted small'>Estado</div>
                    <span className={`badge ${getEstadoBadgeClass(mockPersona.estado)}`}>
                      {mockPersona.estado}
                    </span>
                  </div>
                  <div className='mb-0'>
                    <div className='text-muted small'>Último acceso</div>
                    <div className='fw-medium'>{mockPersona.ultimoAcceso}</div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className='card shadow-sm mb-4'>
                <div className='card-header bg-transparent'>
                  <h6 className='mb-0'>Acciones Rápidas</h6>
                </div>
                <div className='card-body'>
                  <div className='d-grid gap-2'>
                    <button className='btn btn-outline-primary text-start'>
                      <i className='material-icons me-2'>email</i>
                      Enviar email
                    </button>
                    <button className='btn btn-outline-primary text-start'>
                      <i className='material-icons me-2'>receipt_long</i>
                      Ver estado de cuenta
                    </button>
                    <button className='btn btn-outline-primary text-start'>
                      <i className='material-icons me-2'>add_home</i>
                      Asignar nueva unidad
                    </button>
                    <button className='btn btn-outline-primary text-start'>
                      <i className='material-icons me-2'>vpn_key</i>
                      Restablecer contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='col-12 col-lg-8'>
              {/* Tabs */}
              <ul className='nav nav-tabs mb-4'>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${activeTab === 'unidades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unidades')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>home</i>
                    Unidades
                  </button>
                </li>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagos')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>receipt</i>
                    Pagos
                  </button>
                </li>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${activeTab === 'actividad' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actividad')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>history</i>
                    Actividad
                  </button>
                </li>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${activeTab === 'documentos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documentos')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>folder</i>
                    Documentos
                  </button>
                </li>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${activeTab === 'notas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notas')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>sticky_note_2</i>
                    Notas
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className='tab-content'>
                {/* Unidades Tab */}
                {activeTab === 'unidades' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Unidades Asociadas</h6>
                      <button className='btn btn-sm btn-primary'>
                        <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
                        Asignar Unidad
                      </button>
                    </div>
                    <div className='card-body'>
                      {mockPersona.unidades.map((unidad) => (
                        <div key={unidad.id} className='card mb-3 border'>
                          <div className='card-header bg-light d-flex justify-content-between align-items-center'>
                            <div>
                              <h6 className='mb-0'>{unidad.nombre}</h6>
                              <div className='small text-muted'>{unidad.edificio} - {unidad.comunidad}</div>
                            </div>
                            <span className={`badge ${getTipoBadgeClass(unidad.relacion)}`}>
                              {unidad.relacion}
                            </span>
                          </div>
                          <div className='card-body'>
                            <div className='row'>
                              <div className='col-md-6'>
                                <div className='mb-2'>
                                  <div className='small text-muted'>Dirección</div>
                                  <div className='fw-medium'>{unidad.direccion}</div>
                                </div>
                                <div>
                                  <div className='small text-muted'>Metros Cuadrados</div>
                                  <div className='fw-medium'>{unidad.metrosCuadrados} m²</div>
                                </div>
                              </div>
                              <div className='col-md-6'>
                                <div className='mb-2'>
                                  <div className='small text-muted'>Estado</div>
                                  <div className='fw-medium'>
                                    <span className='d-inline-flex align-items-center'>
                                      <span 
                                        className='me-2'
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--color-success)'
                                        }}
                                      />
                                      {unidad.estado}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className='small text-muted'>Saldo Pendiente</div>
                                  <div className='fw-medium text-success'>{formatCurrency(unidad.saldoPendiente)}</div>
                                </div>
                              </div>
                              <div className='col-12 mt-3'>
                                <Link href={`/unidades/${unidad.id}`} className='btn btn-sm btn-outline-primary'>
                                  Ver Unidad
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagos Tab */}
                {activeTab === 'pagos' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Historial de Pagos</h6>
                      <button className='btn btn-sm btn-primary'>
                        <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
                        Registrar Pago
                      </button>
                    </div>
                    <div className='card-body'>
                      <div className='table-responsive'>
                        <table className='table table-hover'>
                          <thead className='table-light'>
                            <tr>
                              <th>#</th>
                              <th>Fecha</th>
                              <th>Unidad</th>
                              <th>Periodo</th>
                              <th>Importe</th>
                              <th>Método</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockPagos.map((pago) => (
                              <tr key={pago.id}>
                                <td>{pago.id}</td>
                                <td>{pago.fecha}</td>
                                <td>{pago.unidad}</td>
                                <td>{pago.periodo}</td>
                                <td>{formatCurrency(pago.importe)}</td>
                                <td>{pago.metodo}</td>
                                <td>
                                  <span className='badge bg-success'>{pago.estado}</span>
                                </td>
                                <td>
                                  <button className='btn btn-sm btn-outline-primary'>
                                    <i className='material-icons' style={{ fontSize: '16px' }}>visibility</i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actividad Tab */}
                {activeTab === 'actividad' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent'>
                      <h6 className='mb-0'>Registro de Actividad</h6>
                    </div>
                    <div className='card-body'>
                      {mockActividades.map((actividad, index) => (
                        <div key={index} className='mb-3 pb-3 border-bottom'>
                          <div className='small text-muted mb-1'>{actividad.fecha}</div>
                          <div className='fw-medium mb-1'>{actividad.titulo}</div>
                          <div className='small text-muted'>{actividad.descripcion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentos Tab */}
                {activeTab === 'documentos' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Documentos</h6>
                      <button className='btn btn-sm btn-primary'>
                        <i className='material-icons me-1' style={{ fontSize: '16px' }}>upload</i>
                        Subir Documento
                      </button>
                    </div>
                    <div className='card-body'>
                      <div className='table-responsive'>
                        <table className='table table-hover'>
                          <thead className='table-light'>
                            <tr>
                              <th>Nombre</th>
                              <th>Tipo</th>
                              <th>Fecha</th>
                              <th>Tamaño</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockDocumentos.map((doc) => (
                              <tr key={doc.id}>
                                <td>
                                  <div className='d-flex align-items-center'>
                                    <i className={`material-icons me-2 ${doc.icono === 'picture_as_pdf' ? 'text-danger' : 'text-info'}`}>
                                      {doc.icono}
                                    </i>
                                    <span>{doc.nombre}</span>
                                  </div>
                                </td>
                                <td>{doc.tipo}</td>
                                <td>{doc.fecha}</td>
                                <td>{doc.tamaño}</td>
                                <td>
                                  <div className='btn-group'>
                                    <button className='btn btn-sm btn-outline-primary'>
                                      <i className='material-icons' style={{ fontSize: '16px' }}>visibility</i>
                                    </button>
                                    <button className='btn btn-sm btn-outline-secondary'>
                                      <i className='material-icons' style={{ fontSize: '16px' }}>download</i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas Tab */}
                {activeTab === 'notas' && (
                  <div className='card shadow-sm'>
                    <div className='card-header bg-transparent d-flex justify-content-between align-items-center'>
                      <h6 className='mb-0'>Notas Internas</h6>
                      <button 
                        className='btn btn-sm btn-primary'
                        onClick={() => setShowNewNoteForm(!showNewNoteForm)}
                      >
                        <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
                        Nueva Nota
                      </button>
                    </div>
                    <div className='card-body'>
                      {mockNotas.map((nota) => (
                        <div key={nota.id} className='card mb-3'>
                          <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                              <h6 className='card-title mb-0'>{nota.titulo}</h6>
                              <div className='text-muted small'>{nota.fecha}</div>
                            </div>
                            <p className='card-text'>{nota.contenido}</p>
                            <div className='d-flex justify-content-between align-items-center'>
                              <div className='small text-muted'>Creado por: {nota.autor}</div>
                              <div>
                                <button className='btn btn-sm btn-outline-secondary me-1'>
                                  <i className='material-icons' style={{ fontSize: '16px' }}>edit</i>
                                </button>
                                <button className='btn btn-sm btn-outline-danger'>
                                  <i className='material-icons' style={{ fontSize: '16px' }}>delete</i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Form para nueva nota */}
                      {showNewNoteForm && (
                        <div className='card mt-4'>
                          <div className='card-body'>
                            <h6 className='card-title mb-3'>Agregar nueva nota</h6>
                            <form>
                              <div className='mb-3'>
                                <label htmlFor='noteTitulo' className='form-label'>Título</label>
                                <input type='text' className='form-control' id='noteTitulo' />
                              </div>
                              <div className='mb-3'>
                                <label htmlFor='noteContenido' className='form-label'>Contenido</label>
                                <textarea className='form-control' id='noteContenido' rows={3}></textarea>
                              </div>
                              <div className='d-flex justify-content-end'>
                                <button 
                                  type='button' 
                                  className='btn btn-outline-secondary me-2'
                                  onClick={() => setShowNewNoteForm(false)}
                                >
                                  Cancelar
                                </button>
                                <button type='submit' className='btn btn-primary'>
                                  Guardar Nota
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
