import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import { createCategoria } from '@/lib/categoriasGastoService';
import comunidadesService from '@/lib/comunidadesService'; // Cambia a import default
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';

interface FormData {
  nombre: string;
  tipo: string;
  cta_contable: string;
  activa: boolean;
}

interface ValidationErrors {
  nombre?: string;
  tipo?: string;
}

const TIPOS_CATEGORIA = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'extraordinario', label: 'Extraordinario' },
  { value: 'fondo_reserva', label: 'Fondo Reserva' },
  { value: 'multas', label: 'Multas' },
  { value: 'consumo', label: 'Consumo' },
];

interface Comunidad {
  id: number;
  nombre: string;
}

export default function CategoriaGastoNueva() {
  const router = useRouter();
  const { user } = useAuth();
  const { isSuperUser, currentRole, getUserCommunities, hasRoleInCommunity } = usePermissions();  // Agrega hasRoleInCommunity
  const { comunidadSeleccionada } = useComunidad();
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [selectedComunidadId, setSelectedComunidadId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'operacional',
    cta_contable: '',
    activa: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const loadedComunidadesRef = useRef(false); // Agrega este ref

  // Resolver comunidad (usar selector global, si no usar user.comunidad_id)
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return selectedComunidadId ?? undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, user?.comunidad_id, selectedComunidadId]);

  // Bloquear acceso si el usuario tiene rol básico
  const isBasicRoleInCommunity = useMemo(() => {
    // Superusuarios siempre tienen acceso
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return false;
    }

    // Si hay una comunidad específica seleccionada, verificar solo esa
    if (resolvedComunidadId) {
      return (
        hasRoleInCommunity(Number(resolvedComunidadId), 'residente') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'propietario') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'inquilino')
      );
    }

    // Si no hay comunidad específica, bloquear si SOLO tiene roles básicos
    const memberships = user?.memberships || [];
    if (memberships.length === 0) {
      return false;
    }

    const hasNonBasicRole = memberships.some((m: any) => {
      const rol = (m.rol || '').toLowerCase();
      return rol !== 'residente' && rol !== 'propietario' && rol !== 'inquilino';
    });

    return !hasNonBasicRole;
  }, [resolvedComunidadId, isSuperUser, hasRoleInCommunity, user?.memberships]);

  useEffect(() => {
    if (isSuperUser && !loadedComunidadesRef.current) {
      loadedComunidadesRef.current = true;
      comunidadesService.getComunidades()
        .then(setComunidades)
        .catch(() => toast.error('Error cargando comunidades'));
    } else if (!isSuperUser) {
      const userCommunities = getUserCommunities();
      setSelectedComunidadId(userCommunities[0]?.comunidadId || null);
    }
  }, [isSuperUser, getUserCommunities]);  // Cambia dependencia

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validación básica
    const newErrors: ValidationErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const comunidadIdToUse = isSuperUser ? selectedComunidadId : selectedComunidadId;
    if (!comunidadIdToUse) {
      toast.error('Selecciona una comunidad');
      setLoading(false);
      return;
    }

    try {
      await createCategoria(comunidadIdToUse, {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        cta_contable: formData.cta_contable.trim() || undefined,
        activa: formData.activa,
      });

      toast.success('Categoría creada exitosamente');
      router.push('/categorias-gasto');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Si tiene rol básico en la comunidad seleccionada, mostrar Acceso Denegado
  if (isBasicRoleInCommunity) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-50'>
              <div className='col-12 col-md-8'>
                <div className='card shadow-sm'>
                  <div className='card-body text-center p-5'>
                    <div className='mb-4'>
                      <span className='material-icons text-danger' style={{ fontSize: '56px' }}>
                        block
                      </span>
                    </div>
                    <h2>Acceso Denegado</h2>
                    <p className='text-muted'>No tienes permisos para crear Categorías de Gasto en la comunidad seleccionada. Solo usuarios con roles administrativos pueden realizar esta acción.</p>
                    <button
                      className='btn btn-primary mt-3'
                      onClick={() => router.push('/categorias-gasto')}
                    >
                      Volver al Listado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Categoría de Gasto — Cuentas Claras</title>
      </Head>

      <Layout title="Crear Nueva Categoría de Gasto">
        <div className="container-fluid p-4">
          <div className="row">
            <div className="col-12 col-md-8 col-lg-6 mx-auto">
              <div className="card">
                <div className="card-body">
                  <h1 className="card-title">Crear Nueva Categoría de Gasto</h1>

                  {isSuperUser && (
                    <div className="mb-3">
                      <label htmlFor="comunidad" className="form-label">
                        Comunidad *
                      </label>
                      <select
                        className="form-select"
                        id="comunidad"
                        value={selectedComunidadId || ''}
                        onChange={e => setSelectedComunidadId(Number(e.target.value))}
                        required
                      >
                        <option value="">Selecciona una comunidad</option>
                        {comunidades.map(com => (
                          <option key={com.id} value={com.id}>
                            {com.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        id="nombre"
                        value={formData.nombre}
                        onChange={e => handleChange('nombre', e.target.value)}
                        required
                        placeholder="Ingrese el nombre de la categoría"
                      />
                      {errors.nombre && (
                        <div className="invalid-feedback">{errors.nombre}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="tipo" className="form-label">
                        Tipo
                      </label>
                      <select
                        className="form-select"
                        id="tipo"
                        value={formData.tipo}
                        onChange={e => handleChange('tipo', e.target.value)}
                      >
                        {TIPOS_CATEGORIA.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="cta_contable" className="form-label">
                        Cuenta Contable
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="cta_contable"
                        value={formData.cta_contable}
                        onChange={e => handleChange('cta_contable', e.target.value)}
                        placeholder="Código de cuenta contable (opcional)"
                      />
                    </div>

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="activa"
                        checked={formData.activa}
                        onChange={e => handleChange('activa', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="activa">
                        Categoría activa
                      </label>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Creando...' : 'Crear Categoría'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.back()}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}