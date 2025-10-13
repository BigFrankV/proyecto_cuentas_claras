import React, { useState } from 'react';

export default function ApelacionFilters({ onApply }: { onApply: (params: Record<string, any>) => void }) {
  const [multaId, setMultaId] = useState('');
  const [estado, setEstado] = useState('');
  const [comunidadId, setComunidadId] = useState('');
  const [personaId, setPersonaId] = useState('');

  function apply() {
    const p: any = {};
    if (multaId) p.multa_id = multaId;
    if (estado) p.estado = estado;
    if (comunidadId) p.comunidad_id = comunidadId;
    if (personaId) p.persona_id = personaId;
    onApply(p);
  }

  function clearAll() {
    setMultaId(''); setEstado(''); setComunidadId(''); setPersonaId('');
    onApply({});
  }

  return (
    <div className="apelacion-filters mb-3">
      <div className="row g-2">
        <div className="col-sm-2">
          <input className="form-control" placeholder="Multa ID" value={multaId} onChange={e=>setMultaId(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <select className="form-select" value={estado} onChange={e=>setEstado(e.target.value)}>
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
        <div className="col-sm-2">
          <input className="form-control" placeholder="Comunidad ID" value={comunidadId} onChange={e=>setComunidadId(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <input className="form-control" placeholder="Persona ID" value={personaId} onChange={e=>setPersonaId(e.target.value)} />
        </div>
        <div className="col-sm-4 d-flex">
          <button className="btn btn-primary me-2" onClick={apply}>Aplicar</button>
          <button className="btn btn-outline-secondary" onClick={clearAll}>Limpiar</button>
        </div>
      </div>
    </div>
  );
}