import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { CargosUnidad, UnitInfo, Cargo } from '@/components/cargos';
import Head from 'next/head';

export default function CargosUnidadPage() {
  const router = useRouter();
  const { unidad } = router.query;
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - Replace with actual API calls
  const mockUnits: Record<string, UnitInfo> = {
    '101-A': {
      numero: '101-A',
      torre: 'Torre A',
      propietario: 'Juan Carlos Pérez López',
      residente: 'María Elena Rodríguez García',
      telefono: '+57 300 123 4567',
      email: 'maria.rodriguez@email.com',
      metrosCuadrados: 85.5,
      coeficiente: 0.0342
    },
    '102-B': {
      numero: '102-B',
      torre: 'Torre B',
      propietario: 'Ana María González Vargas',
      residente: 'Carlos Eduardo Martínez',
      telefono: '+57 301 987 6543',
      email: 'carlos.martinez@email.com',
      metrosCuadrados: 78.2,
      coeficiente: 0.0313
    },
    '201-A': {
      numero: '201-A',
      torre: 'Torre A',
      propietario: 'Roberto Silva Mendoza',
      residente: 'Lucía Patricia Herrera',
      telefono: '+57 302 456 7890',
      email: 'lucia.herrera@email.com',
      metrosCuadrados: 92.1,
      coeficiente: 0.0368
    }
  };

  const mockCargosUnidad: Cargo[] = [
    {
      id: 'CHG-2024-001',
      concepto: 'Administración Enero 2024',
      descripcion: 'Cuota de administración mensual',
      tipo: 'administration',
      estado: 'paid',
      monto: 250000,
      montoAplicado: 250000,
      unidad: String(unidad) || '101-A',
      periodo: '2024-01',
      fechaVencimiento: new Date('2024-01-15'),
      fechaCreacion: new Date('2024-01-01'),
      cuentaCosto: 'ADM-001',
    },
    {
      id: 'CHG-2024-002',
      concepto: 'Administración Febrero 2024',
      descripcion: 'Cuota de administración mensual',
      tipo: 'administration',
      estado: 'pending',
      monto: 250000,
      montoAplicado: 0,
      unidad: String(unidad) || '101-A',
      periodo: '2024-02',
      fechaVencimiento: new Date('2024-02-15'),
      fechaCreacion: new Date('2024-02-01'),
      cuentaCosto: 'ADM-001',
    },
    {
      id: 'CHG-2024-003',
      concepto: 'Administración Marzo 2024',
      descripcion: 'Cuota de administración mensual',
      tipo: 'administration',
      estado: 'approved',
      monto: 250000,
      montoAplicado: 0,
      unidad: String(unidad) || '101-A',
      periodo: '2024-03',
      fechaVencimiento: new Date('2024-03-15'),
      fechaCreacion: new Date('2024-03-01'),
      cuentaCosto: 'ADM-001',
    },
    {
      id: 'CHG-2024-004',
      concepto: 'Mantenimiento Ascensor',
      descripcion: 'Mantenimiento preventivo del ascensor principal',
      tipo: 'maintenance',
      estado: 'approved',
      monto: 180000,
      montoAplicado: 180000,
      unidad: String(unidad) || '101-A',
      periodo: '2024-02',
      fechaVencimiento: new Date('2024-02-28'),
      fechaCreacion: new Date('2024-02-01'),
      cuentaCosto: 'MNT-002',
    },
    {
      id: 'CHG-2024-005',
      concepto: 'Seguro Todo Riesgo',
      descripcion: 'Prima de seguro anual edificio',
      tipo: 'insurance',
      estado: 'partial',
      monto: 450000,
      montoAplicado: 225000,
      unidad: String(unidad) || '101-A',
      periodo: '2024-03',
      fechaVencimiento: new Date('2024-03-30'),
      fechaCreacion: new Date('2024-03-01'),
      cuentaCosto: 'SEG-001',
    },
    {
      id: 'CHG-2024-006',
      concepto: 'Servicios Públicos',
      descripcion: 'Consumo de agua y luz áreas comunes',
      tipo: 'service',
      estado: 'pending',
      monto: 85000,
      montoAplicado: 0,
      unidad: String(unidad) || '101-A',
      periodo: '2024-02',
      fechaVencimiento: new Date('2024-02-20'),
      fechaCreacion: new Date('2024-02-05'),
      cuentaCosto: 'SER-001',
    },
    {
      id: 'CHG-2024-007',
      concepto: 'Jardinería y Aseo',
      descripcion: 'Mantenimiento de zonas verdes y aseo general',
      tipo: 'maintenance',
      estado: 'paid',
      monto: 120000,
      montoAplicado: 120000,
      unidad: String(unidad) || '101-A',
      periodo: '2024-01',
      fechaVencimiento: new Date('2024-01-25'),
      fechaCreacion: new Date('2024-01-10'),
      cuentaCosto: 'MNT-001',
    },
    {
      id: 'CHG-2024-008',
      concepto: 'Vigilancia y Portería',
      descripcion: 'Servicio de vigilancia 24/7 y portería',
      tipo: 'service',
      estado: 'paid',
      monto: 320000,
      montoAplicado: 320000,
      unidad: String(unidad) || '101-A',
      periodo: '2024-01',
      fechaVencimiento: new Date('2024-01-31'),
      fechaCreacion: new Date('2024-01-01'),
      cuentaCosto: 'SER-002',
    }
  ];

  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unidad) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        // const [unitResponse, cargosResponse] = await Promise.all([
        //   fetch(`/api/unidades/${unidad}`),
        //   fetch(`/api/cargos?unidad=${unidad}`)
        // ]);
        
        // if (!unitResponse.ok) {
        //   throw new Error('Unidad no encontrada');
        // }
        
        // const unitData = await unitResponse.json();
        // const cargosData = await cargosResponse.json();

        // Mock delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const unitData = mockUnits[String(unidad)];
        if (!unitData) {
          throw new Error('Unidad no encontrada');
        }
        
        setUnitInfo(unitData);
        setCargos(mockCargosUnidad);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unidad]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted">Cargando información de la unidad...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !unitInfo) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid p-4">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="text-center">
                  <i className="material-icons display-1 text-muted">home_work</i>
                  <h2 className="mt-3">Unidad no encontrada</h2>
                  <p className="text-muted mb-4">
                    {error || 'La unidad solicitada no existe o no tienes permisos para verla.'}
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
                      className="btn btn-outline-primary"
                      onClick={() => router.push('/unidades')}
                    >
                      <i className="material-icons me-2">home</i>
                      Ver Unidades
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
        <title>Cargos Unidad {unitInfo.numero} — Cuentas Claras</title>
      </Head>

      <Layout title={`Cargos Unidad ${unitInfo.numero}`}>
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
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => router.push('/unidades')}
                >
                  Unidades
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Unidad {unitInfo.numero}
              </li>
            </ol>
          </nav>

          <CargosUnidad 
            unidad={unitInfo}
            cargos={cargos}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}