import React from 'react';
import { Table, Button } from 'react-bootstrap';
import type { Proveedor } from '@/types/proveedores';

export interface ProviderTableProps {
  providers: Proveedor[];
  loading?: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (p: Proveedor) => void;
}

export default function ProviderTable({ providers, loading, onView, onEdit, onDelete }: ProviderTableProps) {
  if (loading) return <div className="py-4 text-center">Cargando proveedores...</div>;
  if (!providers.length) return <div className="py-4 text-center text-muted">No se encontraron proveedores</div>;

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="small text-muted">
          <tr>
            <th>Proveedor</th>
            <th>Categoría / Giro</th>
            <th>Contacto</th>
            <th>Comunidad</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.id}>
              <td>
                <div className="fw-medium">{p.nombre}</div>
                <small className="text-muted">{p.rut}-{p.dv}</small>
              </td>
              <td>{p.giro ?? '-'}</td>
              <td>
                <div>{p.telefono ?? '-'}</div>
                <small className="text-muted">{p.email ?? '-'}</small>
              </td>
              <td className="text-muted">{p.comunidad_nombre}</td>
              <td>{p.activo === 1 ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
              <td className="text-end">
                <div className="d-flex gap-1 justify-content-end">
                  <Button variant="outline-info" size="sm" onClick={() => onView(p.id)}><span className="material-icons">visibility</span></Button>
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(p.id)}><span className="material-icons">edit</span></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(p)}><span className="material-icons">delete</span></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}