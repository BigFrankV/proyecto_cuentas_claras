import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { CargoDetalle, Cargo, PaymentRecord, Document, TimelineItem } from '@/components/cargos';
import Head from 'next/head';

export default function CargoDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - Replace with actual API calls
  const mockCargo: Cargo = {
    id: 'CHG-2024-001',
    concepto: 'Administración Enero 2024',
    descripcion: 'Cuota de administración mensual correspondiente al período enero 2024',
    tipo: 'administration',
    estado: 'paid',
    monto: 250000,
    montoAplicado: 250000,
    unidad: '101-A',
    periodo: '2024-01',
    fechaVencimiento: new Date('2024-01-15'),
    fechaCreacion: new Date('2024-01-01'),
    cuentaCosto: 'ADM-001',
    observaciones: 'Cargo generado automáticamente según resolución de la asamblea general.'
  };

  const mockPayments: PaymentRecord[] = [
    {
      id: 'PAY-001',
      fecha: new Date('2024-01-10'),
      monto: 125000,
      metodo: 'Transferencia Bancaria',
      referencia: 'TRF-001-2024',
      estado: 'completed',
      observaciones: 'Pago parcial inicial'
    },
    {
      id: 'PAY-002',
      fecha: new Date('2024-01-15'),
      monto: 125000,
      metodo: 'PSE',
      referencia: 'PSE-002-2024',
      estado: 'completed',
      observaciones: 'Completar pago restante antes del vencimiento'
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: 'DOC-001',
      nombre: 'Factura_Administracion_Enero_2024.pdf',
      tipo: 'PDF',
      tamaño: 256789,
      fechaSubida: new Date('2024-01-01'),
      url: '/documents/factura-adm-ene-2024.pdf'
    },
    {
      id: 'DOC-002',
      nombre: 'Soporte_Pago_Transferencia.jpg',
      tipo: 'Image',
      tamaño: 98432,
      fechaSubida: new Date('2024-01-10'),
      url: '/documents/soporte-pago-001.jpg'
    },
    {
      id: 'DOC-003',
      nombre: 'Comprobante_PSE.pdf',
      tipo: 'PDF',
      tamaño: 143256,
      fechaSubida: new Date('2024-01-15'),
      url: '/documents/comprobante-pse-002.pdf'
    }
  ];

  const mockTimeline: TimelineItem[] = [
    {
      id: 'TL-001',
      type: 'info',
      title: 'Cargo Creado',
      content: 'Se creó el cargo de administración para enero 2024 según resolución de asamblea',
      date: new Date('2024-01-01 09:00:00'),
      user: 'Sistema Admin'
    },
    {
      id: 'TL-002',
      type: 'success',
      title: 'Cargo Aprobado',
      content: 'El cargo fue aprobado por el administrador y enviado para notificación',
      date: new Date('2024-01-02 14:30:00'),
      user: 'María González'
    },
    {
      id: 'TL-003',
      type: 'info',
      title: 'Notificación Enviada',
      content: 'Se envió notificación por email y WhatsApp al propietario y residente',
      date: new Date('2024-01-02 15:00:00'),
      user: 'Sistema Notificaciones'
    },
    {
      id: 'TL-004',
      type: 'success',
      title: 'Pago Parcial Recibido',
      content: 'Se recibió pago parcial por $125.000 vía transferencia bancaria. Referencia: TRF-001-2024',
      date: new Date('2024-01-10 16:45:00'),
      user: 'Sistema Pagos'
    },
    {
      id: 'TL-005',
      type: 'success',
      title: 'Pago Completado',
      content: 'Se completó el pago total del cargo vía PSE. Referencia: PSE-002-2024',
      date: new Date('2024-01-15 11:20:00'),
      user: 'Sistema Pagos'
    },
    {
      id: 'TL-006',
      type: 'success',
      title: 'Cargo Cancelado',
      content: 'El cargo fue marcado como pagado en su totalidad y cancelado del sistema',
      date: new Date('2024-01-15 11:25:00'),
      user: 'Sistema Pagos'
    }
  ];

  useEffect(() => {
    const fetchCargo = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/cargos/${id}`);
        // if (!response.ok) {
        //   throw new Error('Cargo no encontrado');
        // }
        // const cargoData = await response.json();
        
        // Mock delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate cargo not found for invalid IDs
        if (id !== 'CHG-2024-001') {
          throw new Error('Cargo no encontrado');
        }
        
        setCargo(mockCargo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCargo();
  }, [id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted">Cargando información del cargo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !cargo) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid p-4">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="text-center">
                  <i className="material-icons display-1 text-muted">error_outline</i>
                  <h2 className="mt-3">Cargo no encontrado</h2>
                  <p className="text-muted mb-4">
                    {error || 'El cargo solicitado no existe o no tienes permisos para verlo.'}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={() => router.push('/cargos')}
                    >
                      <i className="material-icons me-2">arrow_back</i>
                      Volver a Cargos
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => router.reload()}
                    >
                      <i className="material-icons me-2">refresh</i>
                      Reintentar
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
        <title>{cargo.concepto} — Cuentas Claras</title>
      </Head>

      <Layout title={`Cargo ${cargo.id}`}>
        <div className="container-fluid p-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => router.push('/cargos')}
                >
                  Cargos
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {cargo.id}
              </li>
            </ol>
          </nav>

          <CargoDetalle 
            cargo={cargo}
            pagos={mockPayments}
            documentos={mockDocuments}
            historial={mockTimeline}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}