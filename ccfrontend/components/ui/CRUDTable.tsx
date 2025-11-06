'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Pagination,
} from 'react-bootstrap';
import {
  Pencil,
  Trash,
  Plus,
  Search,
  Download,
  Upload,
} from 'react-bootstrap-icons';

/**
 * CRUD TABLE GENÉRICO
 * Componente reutilizable para gestionar CRUD de cualquier entidad
 * Soporta: listar, crear, editar, eliminar con modal
 */

export interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'status' | 'badge';
}

export interface ActionConfig {
  name: string;
  icon?: React.ReactNode;
  action: (row: any) => void;
  variant?: string;
  confirm?: boolean;
}

export interface CRUDTableProps {
  title: string;
  columns: ColumnConfig[];
  data: any[];
  actions?: ActionConfig[];
  onEdit?: (row: any) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  loading?: boolean;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  exportable?: boolean;
  onSearch?: (term: string) => void;
}

const CRUDTable: React.FC<CRUDTableProps> = ({
  title,
  columns,
  data,
  actions = [],
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  searchable = true,
  exportable = true,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(data.map((_, i) => i));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index: number) => {
    setSelectedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index],
    );
  };

  const handleExport = () => {
    // Convertir datos a CSV
    const csv = [
      columns.map(c => c.label).join(','),
      ...data.map(row =>
        columns
          .map(col => {
            const value = row[col.key];
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          })
          .join(','),
      ),
    ].join('\n');

    // Descargar como archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase()}-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="crud-table-container p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{title}</h2>
        <div className="d-flex gap-2">
          {exportable && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleExport}
              disabled={data.length === 0}
              title="Exportar a CSV"
            >
              <Download size={18} /> Exportar
            </Button>
          )}
          {onAdd && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAdd}
            >
              <Plus size={18} /> Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {searchable && (
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
          <div className="table-responsive">
            <Table hover striped borderless className="table-sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.map(col => (
                    <th key={col.key} style={{ width: col.width }}>
                      {col.label}
                      {col.sortable && ' 🔽'}
                    </th>
                  ))}
                  {(onEdit || onDelete || actions.length > 0) && (
                    <th style={{ width: '150px' }}>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="text-center py-4 text-muted"
                    >
                      No hay registros disponibles
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className={selectedRows.includes(idx) ? 'table-active' : ''}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(idx)}
                          onChange={() => handleSelectRow(idx)}
                        />
                      </td>
                      {columns.map(col => (
                        <td key={col.key}>
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                        </td>
                      ))}
                      <td className="text-end">
                        <div className="btn-group btn-group-sm" role="group">
                          {onEdit && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => onEdit(row)}
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('¿Eliminar este registro?')) {
                                  onDelete(row.id);
                                }
                              }}
                              title="Eliminar"
                            >
                              <Trash size={14} />
                            </Button>
                          )}
                          {actions.map((action, i) => (
                            <Button
                              key={i}
                              variant={action.variant || 'info'}
                              size="sm"
                              onClick={() => action.action(row)}
                              title={action.name}
                            >
                              {action.icon || action.name}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const page =
                    currentPage > 2 ? currentPage - 2 + i : i + 1;
                  return (
                    page <= pagination.pages && (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    )
                  );
                })}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={currentPage === pagination.pages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CRUDTable;
