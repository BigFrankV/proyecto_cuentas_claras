import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listApelaciones } from '@/lib/apelacionesService';
import { useAuth } from '@/lib/useAuth';
import Layout from '@/components/layout/Layout';

export default function ApelacionesListadoPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await listApelaciones({ page, perPage: 50 }, token);
        setData(r.data || []);
      } catch (e) {
        console.error('listApelaciones.error', e);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, page]);

  return (
    <Layout title='Lista de Apelaciones'>
      <div className='container-fluid p-4'>
        {/* Header con búsqueda y notificaciones */}
        <header className='bg-white border-bottom shadow-sm p-3 mb-4'>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center'>
              <button className='btn btn-link d-lg-none me-3' onClick={() => {/* toggle sidebar */}}>
                <i className='material-icons'>menu</i>
              </button>
              <h1 className='h4 mb-0'>Apelaciones</h1>
            </div>
            <div className='d-flex align-items-center'>
              <div className='input-group me-3' style={{ maxWidth: '300px' }}>
                <span className='input-group-text'><i className='material-icons'>search</i></span>
                <input type='text' className='form-control' placeholder='Buscar apelaciones...' />
              </div>
              <button className='btn btn-outline-secondary me-2'>
                <i className='material-icons'>notifications</i>
              </button>
              <div className='dropdown'>
                <button className='btn btn-outline-secondary dropdown-toggle' type='button' data-bs-toggle='dropdown'>
                  <div className='avatar'>AL</div>
                </button>
                <ul className='dropdown-menu'>
                  <li><a className='dropdown-item' href='#'>Perfil</a></li>
                  <li><a className='dropdown-item' href='#'>Configuración</a></li>
                  <li><hr className='dropdown-divider' /></li>
                  <li><a className='dropdown-item' href='#'>Cerrar sesión</a></li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Header con título y botón nueva apelación */}
        <div className='d-flex justify-content-between align-items-center mb-4'>
          <h1 className='h3'>Lista de Apelaciones</h1>
          <Link href='/apelaciones/nuevo' className='btn btn-primary'>
            <i className='material-icons me-2'>add</i>
            Nueva Apelación
          </Link>
        </div>

        {loading && <div>Cargando...</div>}

        {!loading && (
          <table className='table table-sm'>
            <thead>
              <tr>
                <th>#</th>
                <th>Multa</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(a => (
                <tr key={a.id}>
                  <td><Link href={`/apelaciones/${a.id}`}>{a.id}</Link></td>
                  <td><Link href={`/multas/${a.multa_id}`}>{a.multa_id}</Link></td>
                  <td>{a.motivo?.slice(0,80)}</td>
                  <td>{a.estado}</td>
                  <td>{a.fecha_apelacion ? new Date(a.fecha_apelacion).toLocaleString() : ''}</td>
                  <td>
                    <Link href={`/apelaciones/${a.id}`} className="btn btn-sm btn-outline-secondary me-1">Ver</Link>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6}>No hay apelaciones</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para revisar apelación */}
      <div className='modal fade' id='reviewModal' tabIndex={-1}>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Revisar Apelación</h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <div className='modal-body'>
              <div className='row'>
                <div className='col-md-6'>
                  <h6>Información de la Apelación</h6>
                  <div className='mb-3'>
                    <strong>ID Apelación:</strong> A-2024-001
                  </div>
                  <div className='mb-3'>
                    <strong>ID Multa:</strong> M-2024-089
                  </div>
                  <div className='mb-3'>
                    <strong>Residente:</strong> Juan Pérez
                  </div>
                  <div className='mb-3'>
                    <strong>Unidad:</strong> A-101
                  </div>
                </div>
                <div className='col-md-6'>
                  <h6>Motivo de la Apelación</h6>
                  <p>El residente solicita reconsideración debido a circunstancias atenuantes no consideradas inicialmente.</p>
                  <h6>Evidencia Adjunta</h6>
                  <ul>
                    <li><a href='#'>documento_prueba.pdf</a></li>
                    <li><a href='#'>foto_evidencia.jpg</a></li>
                  </ul>
                </div>
              </div>
              <div className='mt-3'>
                <label className='form-label'>Comentarios del Revisor</label>
                <textarea className='form-control' rows={3} placeholder='Ingrese sus comentarios...'></textarea>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>Cancelar</button>
              <button type='button' className='btn btn-success'>Aprobar Apelación</button>
              <button type='button' className='btn btn-danger'>Rechazar Apelación</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};