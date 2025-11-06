'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
  Row,
  Col,
} from 'react-bootstrap';
import {
  CheckCircle,
  XCircle,
  Save,
  X as XIcon,
} from 'react-bootstrap-icons';

/**
 * CRUD FORM GENÉRICO
 * Componente reutilizable para crear y editar entidades
 */

export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  validation?: (value: any) => string | null;
  help?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  defaultValue?: any;
  width?: 'full' | 'half' | 'third';
  dependsOn?: string;
  showIf?: (formData: any) => boolean;
}

export interface CRUDFormProps {
  title: string;
  fields: FormFieldConfig[];
  initialData?: any;
  onSubmit: (data: any) => Promise<any>;
  onCancel?: () => void;
  submitButtonLabel?: string;
  loading?: boolean;
  readOnly?: boolean;
  layout?: 'default' | 'modal' | 'inline';
}

const CRUDForm: React.FC<CRUDFormProps> = ({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonLabel = 'Guardar',
  loading = false,
  readOnly = false,
  layout = 'default',
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Inicializar datos
  useEffect(() => {
    const initialFormData: any = {};
    fields.forEach(field => {
      initialFormData[field.name] =
        initialData[field.name] || field.defaultValue || '';
    });
    setFormData(initialFormData);
  }, [initialData, fields]);

  const validateField = (field: FormFieldConfig, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} es requerido`;
    }

    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }

    if (field.type === 'number' && value) {
      if (field.min !== undefined && parseFloat(value) < field.min) {
        return `Valor mínimo: ${field.min}`;
      }
      if (field.max !== undefined && parseFloat(value) > field.max) {
        return `Valor máximo: ${field.max}`;
      }
    }

    if (field.validation) {
      const error = field.validation(value);
      if (error) {
        return error;
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);

    // Limpiar error del campo
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Por favor corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await onSubmit(formData);
      setSuccessMessage('Guardado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.message || 'Error al guardar los datos',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar campos por ancho
  const groupedFields = fields.reduce(
    (acc, field) => {
      if (field.showIf && !field.showIf(formData)) {
        return acc;
      }
      const width = field.width || 'full';
      if (!acc[width]) {
        acc[width] = [];
      }
      acc[width].push(field);
      return acc;
    },
    {} as Record<string, FormFieldConfig[]>,
  );

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isInvalid = !!error;

    const commonProps = {
      id: field.name,
      disabled: readOnly || field.disabled || isSubmitting || loading,
      isInvalid,
    };

    const labelCol = (
      <Form.Label column sm={4}>
        {field.label}
        {field.required && <span className="text-danger">*</span>}
      </Form.Label>
    );

    let control;

    switch (field.type) {
      case 'textarea':
        control = (
          <Form.Control
            {...commonProps}
            as="textarea"
            rows={field.rows || 3}
            placeholder={field.placeholder}
            value={value}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            readOnly={readOnly}
          />
        );
        break;

      case 'select':
        control = (
          <Form.Select
            {...commonProps}
            value={value}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            disabled={readOnly || field.disabled || isSubmitting || loading}
          >
            <option value="">-- Seleccionar --</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );
        break;

      case 'checkbox':
        control = (
          <Form.Check
            {...commonProps}
            type="checkbox"
            checked={value}
            onChange={e => handleFieldChange(field.name, e.target.checked)}
          />
        );
        break;

      case 'radio':
        control = (
          <div>
            {field.options?.map(opt => (
              <Form.Check
                key={opt.value}
                {...commonProps}
                type="radio"
                name={field.name}
                label={opt.label}
                value={opt.value}
                checked={value === opt.value}
                onChange={e => handleFieldChange(field.name, e.target.value)}
              />
            ))}
          </div>
        );
        break;

      default:
        control = (
          <Form.Control
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            readOnly={readOnly}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }

    return (
      <Form.Group key={field.name} className="mb-3" controlId={field.name}>
        <Form.Label>
          {field.label}
          {field.required && <span className="text-danger">*</span>}
        </Form.Label>
        {control}
        {error && <Form.Text className="text-danger d-block">{error}</Form.Text>}
        {field.help && !error && (
          <Form.Text className="text-muted d-block">{field.help}</Form.Text>
        )}
      </Form.Group>
    );
  };

  const formContent = (
    <Form onSubmit={handleSubmit}>
      {/* Alerts */}
      {successMessage && (
        <Alert variant="success" className="mb-3">
          <CheckCircle size={18} className="me-2" />
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          <XCircle size={18} className="me-2" />
          {errorMessage}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" className="me-2" />
          Cargando...
        </div>
      )}

      {/* Fields */}
      {!loading && (
        <>
          {/* Full width fields */}
          {groupedFields['full']?.map(field => renderField(field))}

          {/* Half width fields */}
          {groupedFields['half'] && groupedFields['half'].length > 0 && (
            <Row>
              {groupedFields['half'].map(field => (
                <Col key={field.name} md={6}>
                  {renderField(field)}
                </Col>
              ))}
            </Row>
          )}

          {/* Third width fields */}
          {groupedFields['third'] && groupedFields['third'].length > 0 && (
            <Row>
              {groupedFields['third'].map(field => (
                <Col key={field.name} md={4}>
                  {renderField(field)}
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="d-flex gap-2 mt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} className="me-2" />
                {submitButtonLabel}
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              <XIcon size={18} className="me-2" />
              Cancelar
            </Button>
          )}
        </div>
      )}
    </Form>
  );

  if (layout === 'modal') {
    return (
      <Modal.Body>
        <h5 className="mb-4">{title}</h5>
        {formContent}
      </Modal.Body>
    );
  }

  return (
    <div className="crud-form-container p-4">
      <h2 className="mb-4">{title}</h2>
      {formContent}
    </div>
  );
};

export default CRUDForm;
