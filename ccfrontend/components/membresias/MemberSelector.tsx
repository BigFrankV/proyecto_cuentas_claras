interface MemberSelectorProps {
  onMemberSelect: (member: any) => void;
  disabled?: boolean;
}

export default function MemberSelector({
  onMemberSelect,
  disabled = false,
}: MemberSelectorProps) {
  // Mock data - reemplazar con búsqueda real
  const mockMembers = [
    {
      id: '1',
      name: 'Juan Delgado',
      document: '12.345.678-9',
      type: 'Propietario',
      unit: 'Edificio A - Depto 101',
      email: 'juan.delgado@email.com',
    },
    {
      id: '2',
      name: 'María González',
      document: '98.765.432-1',
      type: 'Inquilino',
      unit: 'Edificio B - Depto 203',
      email: 'maria.gonzalez@email.com',
    },
  ];

  return (
    <div className='member-selector'>
      <div className='mb-3'>
        <div className='input-group'>
          <span className='input-group-text'>
            <i className='material-icons' style={{ fontSize: '18px' }}>
              search
            </i>
          </span>
          <input
            type='text'
            className='form-control'
            placeholder='Buscar persona por nombre, documento o unidad...'
            disabled={disabled}
          />
          <button
            className='btn btn-outline-secondary'
            type='button'
            disabled={disabled}
          >
            Buscar
          </button>
        </div>
        <div className='form-text'>
          Puede buscar por nombre, documento, o unidad asociada.
        </div>
      </div>

      {!disabled && (
        <div className='member-results'>
          <h6 className='mb-3'>Resultados de búsqueda:</h6>
          {mockMembers.map(member => (
            <div
              key={member.id}
              className='member-card'
              onClick={() => onMemberSelect(member)}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                marginBottom: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div className='d-flex align-items-center'>
                <div
                  className='avatar me-3'
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div className='flex-grow-1'>
                  <h6 className='mb-1'>{member.name}</h6>
                  <div className='text-muted small'>
                    {member.document} • {member.type} • {member.unit}
                  </div>
                  <div className='text-muted small'>{member.email}</div>
                </div>
                <div>
                  <i className='material-icons text-muted'>
                    keyboard_arrow_right
                  </i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .member-card:hover {
          border-color: var(--color-primary);
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
