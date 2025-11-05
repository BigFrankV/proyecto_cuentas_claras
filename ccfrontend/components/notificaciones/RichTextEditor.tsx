import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  showToolbar?: boolean;
  showVariables?: boolean;
  className?: string;
}

interface ToolbarAction {
  id: string;
  icon: string;
  title: string;
  action: () => void;
}

const variables = [
  { key: '{{nombre_usuario}}', description: 'Nombre del destinatario' },
  { key: '{{numero_unidad}}', description: 'Número de unidad' },
  { key: '{{nombre_edificio}}', description: 'Nombre del edificio' },
  { key: '{{fecha_actual}}', description: 'Fecha actual' },
  { key: '{{administrador}}', description: 'Nombre del administrador' },
  {
    key: '{{telefono_administracion}}',
    description: 'Teléfono de administración',
  },
  { key: '{{email_administracion}}', description: 'Email de administración' },
  { key: '{{direccion_conjunto}}', description: 'Dirección del conjunto' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe tu mensaje aquí...',
  minHeight = 200,
  maxLength,
  showToolbar = true,
  showVariables = true,
  className = '',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVariablePanel, setShowVariablePanel] = useState(false);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const wrapSelection = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);

    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, end + before.length);
      } else {
        textarea.setSelectionRange(
          start + before.length,
          start + before.length,
        );
      }
    }, 0);
  };

  const toolbarActions: ToolbarAction[] = [
    {
      id: 'bold',
      icon: 'format_bold',
      title: 'Negrita',
      action: () => wrapSelection('**', '**'),
    },
    {
      id: 'italic',
      icon: 'format_italic',
      title: 'Cursiva',
      action: () => wrapSelection('*', '*'),
    },
    {
      id: 'underline',
      icon: 'format_underlined',
      title: 'Subrayado',
      action: () => wrapSelection('<u>', '</u>'),
    },
    {
      id: 'bullet-list',
      icon: 'format_list_bulleted',
      title: 'Lista con viñetas',
      action: () => insertText('\n• '),
    },
    {
      id: 'numbered-list',
      icon: 'format_list_numbered',
      title: 'Lista numerada',
      action: () => insertText('\n1. '),
    },
    {
      id: 'link',
      icon: 'link',
      title: 'Enlace',
      action: () => {
        const url = prompt('Ingresa la URL:');
        if (url) {
          wrapSelection('[', `](${url})`);
        }
      },
    },
  ];

  const insertVariable = (variable: string) => {
    insertText(variable);
    setShowVariablePanel(false);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <label className='form-label'>
        Mensaje <span className='text-danger'>*</span>
      </label>

      <div
        className='editor-container'
        style={{
          border: '1px solid #ced4da',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {/* Toolbar */}
        {showToolbar && (
          <div
            className='editor-toolbar'
            style={{
              borderBottom: '1px solid #e9ecef',
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div className='d-flex align-items-center gap-1 flex-wrap'>
              {/* Formatting tools */}
              <div className='btn-group btn-group-sm me-2' role='group'>
                {toolbarActions.slice(0, 3).map(action => (
                  <button
                    key={action.id}
                    type='button'
                    className='btn btn-outline-secondary'
                    title={action.title}
                    onClick={action.action}
                  >
                    <i className='material-icons' style={{ fontSize: '16px' }}>
                      {action.icon}
                    </i>
                  </button>
                ))}
              </div>

              {/* List tools */}
              <div className='btn-group btn-group-sm me-2' role='group'>
                {toolbarActions.slice(3, 5).map(action => (
                  <button
                    key={action.id}
                    type='button'
                    className='btn btn-outline-secondary'
                    title={action.title}
                    onClick={action.action}
                  >
                    <i className='material-icons' style={{ fontSize: '16px' }}>
                      {action.icon}
                    </i>
                  </button>
                ))}
              </div>

              {/* Other tools */}
              <div className='btn-group btn-group-sm me-2' role='group'>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  title='Enlace'
                  onClick={
                    toolbarActions.find(a => a.id === 'link')?.action ||
                    (() => {})
                  }
                >
                  <i className='material-icons' style={{ fontSize: '16px' }}>
                    link
                  </i>
                </button>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  title='Emoticon'
                  onClick={() => insertText(' 😊 ')}
                >
                  <i className='material-icons' style={{ fontSize: '16px' }}>
                    insert_emoticon
                  </i>
                </button>
              </div>

              {/* Variables */}
              {showVariables && (
                <div className='btn-group btn-group-sm' role='group'>
                  <button
                    type='button'
                    className={`btn btn-outline-info ${showVariablePanel ? 'active' : ''}`}
                    title='Variables dinámicas'
                    onClick={() => setShowVariablePanel(!showVariablePanel)}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      code
                    </i>
                    Variables
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Variables Panel */}
        {showVariables && showVariablePanel && (
          <div
            className='variables-panel'
            style={{
              backgroundColor: '#fff3cd',
              borderBottom: '1px solid #e9ecef',
              padding: '1rem',
            }}
          >
            <h6 className='mb-2'>Variables disponibles</h6>
            <p className='small text-muted mb-3'>
              Haz clic en una variable para agregarla al mensaje. Se
              reemplazarán automáticamente por los valores reales al enviar.
            </p>
            <div className='variable-chips d-flex flex-wrap gap-2'>
              {variables.map(variable => (
                <button
                  key={variable.key}
                  type='button'
                  className='btn btn-outline-warning btn-sm'
                  title={variable.description}
                  onClick={() => insertVariable(variable.key)}
                >
                  {variable.key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className='editor-content' style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            className='form-control border-0'
            rows={Math.max(8, Math.ceil(minHeight / 24))}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLength}
            style={{
              resize: 'vertical',
              fontSize: '1rem',
              lineHeight: '1.5',
              minHeight: `${minHeight}px`,
              padding: '1rem',
            }}
          />

          {/* Character count */}
          <div
            className='editor-footer'
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '1rem',
              fontSize: '0.75rem',
              color: '#6c757d',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
            }}
          >
            {value.length}
            {maxLength && `/${maxLength}`} caracteres
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className='form-text mt-2'>
        <div className='d-flex flex-wrap gap-3'>
          <span>
            <strong>**texto**</strong> para negrita
          </span>
          <span>
            <strong>*texto*</strong> para cursiva
          </span>
          <span>
            <strong>[texto](url)</strong> para enlaces
          </span>
        </div>
      </div>
    </div>
  );
}
