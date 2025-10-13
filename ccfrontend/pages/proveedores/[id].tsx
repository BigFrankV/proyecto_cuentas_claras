import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { proveedoresService, Proveedor } from '@/lib/proveedoresService';
import { Badge } from 'react-bootstrap';
import { ProveedorPermissions } from '@/lib/permissionsUtils';

export default function ProveedorDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ AGREGAR VALIDACIÓN DE ROLES:
  useEffect(() => {
    if (user && !ProveedorPermissions.canView(user)) {
      router.push('/dashboard');
      return;
    }
    
    if (id && user) {
      fetchProveedor();
    }
  }, [id, user, router]);

  const fetchProveedor = async () => {
    try {
      setLoading(true);
      const response = await proveedoresService.getProveedor(Number(id));
      setProveedor(response.data);
    } catch (error) {
      console.error('Error fetching proveedor:', error);
      setError('Error al cargar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!proveedor) return;

    try {
      await proveedoresService.cambiarEstado(proveedor.id, !proveedor.activo);
      setProveedor({ ...proveedor, activo: !proveedor.activo });
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setError('Error al cambiar estado del proveedor');
    }
  };

  const handleEliminar = async () => {
    if (!proveedor) return;

    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await proveedoresService.eliminarProveedor(proveedor.id);
        router.push('/proveedores');
      } catch (error) {
        console.error('Error eliminando proveedor:', error);
        setError('Error al eliminar el proveedor');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="container py-4">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando proveedor...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!proveedor) {
    return (
      <ProtectedRoute>
        <Layout title="Proveedor no encontrado">
          <div className="container py-4">
            <div className="alert alert-danger">
              <span className="material-icons me-2">error</span>
              <strong>Proveedor no encontrado</strong>
              <p className="mb-2">El proveedor que buscas no existe o no tienes permisos para verlo.</p>
              <Link href="/proveedores" className="btn btn-primary">
                <span className="material-icons me-2">arrow_back</span>
                Volver a Proveedores
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ✅ VERIFICAR PERMISOS ANTES DE CARGAR:
  if (user && !ProveedorPermissions.canView(user)) {
    return (
      <ProtectedRoute>
        <Layout title="Acceso Denegado">
          <div className="container py-4">
            <div className="alert alert-warning">
              <span className="material-icons me-2">warning</span>
              <strong>Acceso Denegado</strong>
              <p className="mb-2">No tienes permisos para acceder a esta página.</p>
              <Link href="/dashboard" className="btn btn-primary">
                <span className="material-icons me-2">home</span>
                Ir al Dashboard
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
        <title>{proveedor.razon_social} — Cuentas Claras</title>
      </Head>

      <Layout title={`${proveedor.razon_social}`}>
        <div className="container py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/proveedores">Proveedores</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {proveedor.razon_social}
              </li>
            </ol>
          </nav>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <span className="material-icons me-2">error</span>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          {/* Main Content */}
          <div className="row">
            {/* Información Principal */}
            <div className="col-lg-8">
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <span className="material-icons me-2">store</span>
                    Información del Proveedor
                  </h5>
                  <Badge bg={proveedor.activo ? 'success' : 'secondary'} className="fs-6">
                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">RAZÓN SOCIAL</label>
                      <p className="mb-0 fs-5">{proveedor.razon_social}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">RUT</label>
                      <p className="mb-0 font-monospace fs-5">{proveedor.rut}-{proveedor.dv}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">GIRO</label>
                      <p className="mb-0">{proveedor.giro || 'No especificado'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">EMAIL</label>
                      <p className="mb-0">
                        {proveedor.email ? (
                          <a href={`mailto:${proveedor.email}`} className="text-decoration-none">
                            <span className="material-icons small me-1">email</span>
                            {proveedor.email}
                          </a>
                        ) : 'No especificado'}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">TELÉFONO</label>
                      <p className="mb-0">
                        {proveedor.telefono ? (
                          <a href={`tel:${proveedor.telefono}`} className="text-decoration-none">
                            <span className="material-icons small me-1">phone</span>
                            {proveedor.telefono}
                          </a>
                        ) : 'No especificado'}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="fw-bold text-muted small">CALIFICACIÓN</label>
                      <p className="mb-0">
                        {proveedor.calificacion ? (
                          <div className="d-flex align-items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`material-icons small ${i < Math.floor(proveedor.calificacion || 0) ? 'text-warning' : 'text-muted'}`}>
                                star
                              </span>
                            ))}
                            <span className="ms-2">({proveedor.calificacion})</span>
                          </div>
                        ) : (
                          <span className="text-muted">Sin calificar</span>
                        )}
                      </p>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="fw-bold text-muted small">DIRECCIÓN</label>
                      <p className="mb-0">{proveedor.direccion || 'No especificada'}</p>
                    </div>
                    {user?.is_superadmin && (
                      <div className="col-12">
                        <label className="fw-bold text-muted small">COMUNIDAD</label>
                        <p className="mb-0">
                          <Badge bg="info">
                            {proveedor.comunidad_nombre || `ID: ${proveedor.comunidad_id}`}
                          </Badge>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Acciones */}
            <div className="col-lg-4">
              {/* Acciones */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <span className="material-icons me-2">settings</span>
                    Acciones
                  </h6>
                </div>
                <div className="card-body d-grid gap-2">
                  <Link
                    href={`/proveedores/${proveedor.id}/editar`}
                    className="btn btn-primary"
                  >
                    <span className="material-icons me-2">edit</span>
                    Editar Proveedor
                  </Link>

                  <button
                    className={`btn ${proveedor.activo ? 'btn-warning' : 'btn-success'}`}
                    onClick={handleCambiarEstado}
                  >
                    <span className="material-icons me-2">
                      {proveedor.activo ? 'pause' : 'play_arrow'}
                    </span>
                    {proveedor.activo ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={handleEliminar}
                  >
                    <span className="material-icons me-2">delete</span>
                    Eliminar Proveedor
                  </button>

                  <hr />

                  <Link href="/proveedores" className="btn btn-outline-secondary">
                    <span className="material-icons me-2">arrow_back</span>
                    Volver al Listado
                  </Link>
                </div>
              </div>

              {/* Información del Sistema */}
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <span className="material-icons me-2">info</span>
                    Información del Sistema
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="fw-bold text-muted small">FECHA DE REGISTRO</label>
                    <p className="mb-0 small">
                      {proveedor.created_at ? new Date(proveedor.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                    </p>
                  </div>
                  <div className="mb-0">
                    <label className="fw-bold text-muted small">ÚLTIMA ACTUALIZACIÓN</label>
                    <p className="mb-0 small">
                      {proveedor.updated_at ? new Date(proveedor.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                    </p>
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