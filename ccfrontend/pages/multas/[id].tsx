import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import multasService from '@/lib/multasService';
import { useAuth } from '@/lib/useAuth';
import { canRegisterPayment, canEditMulta, canAnularMulta } from '@/lib/usePermissions';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface Multa {
  id: number;
  numero: string;
  comunidad_id: number;
  comunidad_nombre: string;
  unidad_id: number;
  unidad_numero: string;
  torre_nombre?: string;
  edificio_nombre?: string;
  persona_id?: number;
  propietario_nombre?: string;
  propietario_email?: string;
  propietario_telefono?: string;
  tipo_infraccion: string;
  motivo: string; // Alias de tipo_infraccion
  descripcion?: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'apelada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_infraccion: string;
  fecha: string; // Alias de fecha_infraccion
  fecha_vencimiento: string;
  fecha_pago?: string;
  fecha_anulacion?: string;
  motivo_anulacion?: string;
  anulado_por?: number;
  anulado_por_username?: string;
  created_at: string;
  updated_at: string;
}

interface HistorialItem {
  id: number;
  multa_id: number;
  usuario_id: number;
  username: string;
  usuario_nombre?: string;
  accion: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  descripcion?: string;
  ip_address?: string;
  fecha: string;
}

interface Apelacion {
  id: number;
  multa_id: number;
  usuario_id: number;
  motivo: string;
  documentos_json?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuesta?: string;
  respondido_por?: number;
  fecha_respuesta?: string;
  created_at: string;
}

// ============================================
// CONSTANTES
// ============================================

const ESTADO_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    color: '#ffc107',
    bgColor: '#fff3cd',
    icon: 'schedule',
    textColor: '#856404'
  },
  pagado: {
    label: 'Pagado',
    color: '#28a745',
    bgColor: '#d4edda',
    icon: 'check_circle',
    textColor: '#155724'
  },
  vencido: {
    label: 'Vencido',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'error',
    textColor: '#721c24'
  },
  apelada: {
    label: 'Apelada',
    color: '#17a2b8',
    bgColor: '#d1ecf1',
    icon: 'gavel',
    textColor: '#0c5460'
  },
  anulada: {
    label: 'Anulada',
    color: '#6c757d',
    bgColor: '#e2e3e5',
    icon: 'block',
    textColor: '#383d41'
  }
};

const PRIORIDAD_CONFIG = {
  baja: {
    label: 'Baja',
    color: '#28a745',
    icon: 'flag',
    textColor: '#fff'
  },
  media: {
    label: 'Media',
    color: '#ffc107',
    icon: 'flag',
    textColor: '#212529'
  },
  alta: {
    label: 'Alta',
    color: '#ff5722',
    icon: 'flag',
    textColor: '#fff'
  },
  critica: {
    label: 'Crítica',
    color: '#dc3545',
    icon: 'priority_high',
    textColor: '#fff'
  }
};

const ACCION_LABELS: Record<string, string> = {
  creada: 'Multa creada',
  editada: 'Multa editada',
  pago_registrado: 'Pago registrado',
  anulada: 'Multa anulada',
  apelada: 'Apelación presentada',
  apelacion_aprobada: 'Apelación aprobada',
  apelacion_rechazada: 'Apelación rechazada',
  eliminada: 'Multa eliminada'
};

const ACCION_ICONS: Record<string, string> = {
  creada: 'add_circle',
  editada: 'edit',
  pago_registrado: 'payment',
  anulada: 'block',
  apelada: 'gavel',
  apelacion_aprobada: 'thumb_up',
  apelacion_rechazada: 'thumb_down',
  eliminada: 'delete'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MultaDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [multa, setMulta] = useState<Multa | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'historial'>('info');
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [showApelacionModal, setShowApelacionModal] = useState(false);

  useEffect(() => {
    if (id) cargarMulta();
  }, [id]);

  const cargarMulta = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await multasService.getMulta(id as string);
      setMulta(data);
      // Asume que el servicio incluye historial; si no, agrega llamada separada
      setHistorial(data.historial || []);
    } catch (err) {
      setError('Error al cargar multa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePago = async (pagoData: any) => {
    try {
      await multasService.registrarPago(id as string, pagoData);
      cargarMulta();
      setShowPagoModal(false);
    } catch (err) {
      setError('Error al registrar pago');
    }
  };

  const handleAnular = async (motivo: string) => {
    try {
      await multasService.anularMulta(id as string, motivo);
      cargarMulta();
      setShowAnularModal(false);
    } catch (err) {
      setError('Error al anular multa');
    }
  };

  if (loading) return <Layout title='Detalle de Multa'><div className='text-center p-4'>Cargando...</div></Layout>;
  if (error || !multa) return <Layout title='Detalle de Multa'><div className='alert alert-danger'>{error || 'Multa no encontrada'}</div></Layout>;

  // Render (copia la estructura del archivo original, reemplaza datos mock con multa y historial)
  return (
    <Layout title={`Detalle de Multa ${multa.numero}`}>
      {/* Copia el JSX completo, reemplazando datos estáticos con multa.historial, etc. */}
      {/* Ejemplo: <h1>{multa.numero}</h1> en lugar de datos mock */}
      {/* Para modales, conecta handlePago, etc. */}
      {/* ... (estructura completa del archivo original) */}
    </Layout>
  );
}