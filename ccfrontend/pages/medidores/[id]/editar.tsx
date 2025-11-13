import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { getMedidor, updateMedidor } from '@/lib/medidoresService';
import { Medidor } from '@/types/medidores';

export default function EditarMedidor() {
    const router = useRouter();
    const { id } = router.query;
    const [medidor, setMedidor] = useState<Medidor | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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