import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// Services
import { gastosService } from '../lib/gastosService';

// Types
import type { CategoriaGasto, GastoCreateRequest } from '../types/gastos';

const NuevoGastoPage: NextPage = () => {
  const router = useRouter();
  const [comunidadId] = useState(1); // TODO: Obtener de contexto

  // Estados
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GastoCreateRequest>({
    categoria_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    glosa: '',
    extraordinario: false
  });

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await gastosService.getCategorias(comunidadId);
        setCategorias(data);
      } catch (error: any) {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar categorías');
      }
    };

    loadCategorias();
  }, [comunidadId]);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria_id || !formData.glosa || !formData.monto) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      await gastosService.createGasto(comunidadId, formData);
      toast.success('Gasto creado exitosamente');
      router.push('/gastos');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al crear gasto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoriaId: number) => {
    setFormData(prev => ({ ...prev, categoria_id: categoriaId }));
  };

  return (
    <>
      <Head>
        <title>Crear Nuevo Gasto - Cuentas Claras</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <div className="container-fluid mb-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button 
            onClick={() => router.back()}
            className="btn btn-link text-secondary p-0 me-3"
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <h4 className="mb-0">Crear Nuevo Gasto</h4>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2 mb-3">Información Básica</h5>
              
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="gasto-descripcion" className="form-label">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="gasto-descripcion" 
                    placeholder="Ej: Reparación de sistema eléctrico"
                    value={formData.glosa}
                    onChange={(e) => setFormData(prev => ({ ...prev, glosa: e.target.value }))}
                    required 
                  />
                </div>
                
                <div className="col-12 col-md-6">
                  <label htmlFor="gasto-fecha" className="form-label">
                    Fecha del gasto <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="gasto-fecha"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    required 
                  />
                </div>
                
                <div className="col-12 col-md-6">
                  <label htmlFor="gasto-monto" className="form-label">
                    Monto <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="gasto-monto" 
                      placeholder="0"
                      value={formData.monto || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Categorización */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2 mb-3">Categorización</h5>
              
              <div className="mb-3">
                <label className="form-label">
                  Categoría de Gasto <span className="text-danger">*</span>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {categorias.filter(c => c.activa).map(categoria => (
                    <button
                      key={categoria.id}
                      type="button"
                      className={`btn ${formData.categoria_id === categoria.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleCategorySelect(categoria.id)}
                    >
                      {categoria.nombre}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="extraordinario"
                  checked={formData.extraordinario}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraordinario: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="extraordinario">
                  Gasto extraordinario
                </label>
                <div className="form-text">
                  Los gastos extraordinarios requieren aprobación especial
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              <span className="material-icons align-middle me-2">cancel</span>
              Cancelar
            </button>
            <div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.categoria_id || !formData.glosa || !formData.monto}
              >
                <span className="material-icons align-middle me-2">check</span>
                {loading ? 'Creando...' : 'Crear Gasto'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        async
      />
    </>
  );
};

export default NuevoGastoPage;