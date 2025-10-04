import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { proveedoresService, Proveedor } from '@/lib/proveedoresService';
import { ProveedorPermissions } from '@/lib/permissionsUtils';

interface FormData {
  razon_social: string;
  rut: string;
  dv: string;
  giro: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

export default function EditarProveedor() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    razon_social: '',
    rut: '',
    dv: '',
    giro: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);

  useEffect(() => {
    if (user && !ProveedorPermissions.canEdit(user)) {
      router.push('/proveedores');
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
      const prov = response.data;
      setProveedor(prov);
      setFormData({
        razon_social: prov.razon_social || '',
        rut: prov.rut || '',
        dv: prov.dv || '',
        giro: prov.giro || '',
        email: prov.email || '',
        telefono: prov.telefono || '',
        direccion: prov.direccion || '',
        activo: prov.activo !== false
      });
    } catch (error) {
      console.error('Error fetching proveedor:', error);
      setError('Error al cargar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razon_social.trim()) {
      setError('La razón social es requerida');
      return;
    }

    if (!formData.rut.trim() || !formData.dv.trim()) {
      setError('El RUT es requerido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // ✅ CORREGIR - Solo enviar campos permitidos:
      const updateData = {
        razon_social: formData.razon_social,
        rut: formData.rut,
        dv: formData.dv,
        giro: formData.giro,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion
      };

      await proveedoresService.actualizarProveedor(Number(id), updateData);

      router.push(`/proveedores/${id}`);
    } catch (error: any) {
      console.error('Error updating proveedor:', error);
      setError(error.response?.data?.message || 'Error al actualizar el proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <Layout title="Cargando...">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!proveedor) {
    return (
      <Layout title="Proveedor no encontrado">
        <div className="container py-4">
          <div className="alert alert-danger">
            Proveedor no encontrado
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Editar ${proveedor.razon_social}`}>
      <Head>
        <title>Editar {proveedor.razon_social} — Cuentas Claras</title>
      </Head>

      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/proveedores">Proveedores</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href={`/proveedores/${id}`}>{proveedor.razon_social}</Link>
            </li>
            <li className="breadcrumb-item active">Editar</li>
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

        {/* Form */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <span className="material-icons me-2">edit</span>
                  Editar Proveedor
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="razon_social" className="form-label">
                        Razón Social <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="razon_social"
                        name="razon_social"
                        value={formData.razon_social}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Estado <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="activo"
                        value={formData.activo.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.value === 'true' }))}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="rut" className="form-label">
                        RUT <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="rut"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label htmlFor="dv" className="form-label">
                        DV <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="dv"
                        name="dv"
                        value={formData.dv}
                        onChange={handleChange}
                        maxLength={1}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="giro" className="form-label">Giro</label>
                      <input
                        type="text"
                        className="form-control"
                        id="giro"
                        name="giro"
                        value={formData.giro}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="telefono" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <textarea
                      className="form-control"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons me-2">save</span>
                          Guardar Cambios
                        </>
                      )}
                    </button>

                    <Link href={`/proveedores/${id}`} className="btn btn-secondary">
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}