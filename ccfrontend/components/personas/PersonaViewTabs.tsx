interface PersonaViewTabsProps {
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

export default function PersonaViewTabs({
  viewMode,
  onViewModeChange,
}: PersonaViewTabsProps) {
  return (
    <ul className='nav nav-tabs mb-3'>
      <li className='nav-item'>
        <button
          className={`nav-link ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => onViewModeChange('table')}
        >
          <i className='material-icons me-1' style={{ fontSize: '16px' }}>
            view_list
          </i>
          Lista
        </button>
      </li>
      <li className='nav-item'>
        <button
          className={`nav-link ${viewMode === 'cards' ? 'active' : ''}`}
          onClick={() => onViewModeChange('cards')}
        >
          <i className='material-icons me-1' style={{ fontSize: '16px' }}>
            view_module
          </i>
          Tarjetas
        </button>
      </li>
    </ul>
  );
}

