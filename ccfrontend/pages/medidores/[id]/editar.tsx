import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

import { getMedidor, updateMedidor } from '@/lib/medidoresService';
import { useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { usePermissions } from '@/lib/usePermissions';
import { Medidor } from '@/types/medidores';

export default function EditarMedidor() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const { hasRoleInCommunity, isSuperUser } = usePermissions();
    const { comunidadSeleccionada } = useComunidad();
    const [medidor, setMedidor] = useState<Medidor | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Verificar si el usuario es un rol básico (NO puede editar)
    const isBasicRole = medidor && medidor.comunidad_id ? (
        hasRoleInCommunity(medidor.comunidad_id, 'residente') ||
        hasRoleInCommunity(medidor.comunidad_id, 'propietario') ||
        hasRoleInCommunity(medidor.comunidad_id, 'inquilino')
    ) : false;

    const [formData, setFormData] = useState({
        serialNumber: '',
        brand: '',
        model: '',
        position: '',
        code: '',
    });

    useEffect(() => {
        if (id) {
            const load = async () => {
                try {
                    const data = await getMedidor(Number(id));
                    setMedidor(data);
                    setFormData({
                        serialNumber: data.serial_number || '',
                        brand: data.marca || '',
                        model: data.modelo || '',
                        position: data.ubicacion || '',
                        code: data.codigo || data.codigo || '', // Priorizar numero_medidor
                    });
                } catch (err) {
                    setErrors({ general: 'Error al cargar medidor' });
                }
            };
            load();
        }
    }, [id]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.code) {errors.code = 'Código requerido';}
        if (!formData.serialNumber) {errors.serialNumber = 'Número de serie requerido';}
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const data = {
                serial_number: formData.serialNumber,
                marca: formData.brand,
                modelo: formData.model,
                ubicacion: formData.position,
                codigo: formData.code,
            };

            await updateMedidor(Number(id), data);
            router.push(`/medidores/${id}`);
        } catch (err: any) {
            setErrors({ general: err.response?.data?.error || 'Error al actualizar medidor' });
        } finally {
            setLoading(false);
        }
    };

    if (!medidor) {
        return <div>Cargando...</div>;
    }

    if (isBasicRole) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className='container-fluid'>
                        <div className='row justify-content-center align-items-center min-vh-100'>
                            <div className='col-12 col-md-8 col-lg-6'>
                                <div className='card shadow-lg border-0'>
                                    <div className='card-body text-center p-5'>
                                        <div className='mb-4'>
                                            <span className='material-icons text-danger' style={{ fontSize: '80px' }}>
                                                block
                                            </span>
                                        </div>
                                        <h2 className='card-title mb-3'>Acceso Denegado</h2>
                                        <p className='card-text text-muted mb-4'>
                                            No tienes permisos para editar medidores.
                                            <br />
                                            Si crees que esto es un error, contacta al administrador.
                                        </p>
                                        <div className='d-flex gap-2 justify-content-center'>
                                            <button
                                                type='button'
                                                className='btn btn-primary'
                                                onClick={() => router.back()}
                                            >
                                                <span className='material-icons align-middle me-1'>arrow_back</span>
                                                Volver Atrás
                                            </button>
                                            <button
                                                type='button'
                                                className='btn btn-outline-primary'
                                                onClick={() => router.push('/medidores')}
                                            >
                                                <span className='material-icons align-middle me-1'>list</span>
                                                Ver Medidores
                                            </button>
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

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Código"
            />
            <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Número de serie"
            />
            <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Marca"
            />
            <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Modelo"
            />
            <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Ubicación"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Actualizar'}
            </button>
            {errors.general && <p>{errors.general}</p>}
        </form>
    );
}