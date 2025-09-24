interface VersionBadgeProps {
  version: string;
  isLatest?: boolean;
  size?: 'sm' | 'md';
}

export default function VersionBadge({ version, isLatest = false, size = 'md' }: VersionBadgeProps) {
  return (
    <span 
      className={`version-badge ${isLatest ? 'latest' : ''}`}
      style={{
        backgroundColor: isLatest ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)',
        color: isLatest ? '#28a745' : '#6c757d',
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
        borderRadius: '1rem',
        fontSize: size === 'sm' ? '0.675rem' : '0.75rem',
        fontWeight: '500',
        gap: '0.25rem'
      }}
    >
      {isLatest && (
        <i className='material-icons' style={{ fontSize: size === 'sm' ? '12px' : '14px' }}>
          star
        </i>
      )}
      v{version}
    </span>
  );
}