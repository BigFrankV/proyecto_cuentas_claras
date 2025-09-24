interface TierCardProps {
  tier: {
    id: string;
    name: string;
    displayName: string;
    price: number;
    period: string;
    features: {
      name: string;
      included: boolean;
    }[];
    className: string;
  };
  isSelected: boolean;
  onSelect: (tierId: string) => void;
}

export default function TierCard({ tier, isSelected, onSelect }: TierCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div 
        className={`tier-card ${tier.className} ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(tier.id)}
        style={{
          border: '2px solid #e9ecef',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '100%',
          ...(isSelected && {
            borderColor: 'var(--color-primary)',
            backgroundColor: 'rgba(3, 14, 39, 0.05)'
          })
        }}
      >
        <div className={`tier-badge ${tier.className} mb-2`} style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          borderRadius: '4px'
        }}>
          {tier.name}
        </div>
        <h6 className='tier-header mb-2'>{tier.displayName}</h6>
        <div className='tier-price' style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--color-primary)',
          margin: '0.5rem 0'
        }}>
          {formatPrice(tier.price)}
        </div>
        <div className='tier-period mb-3' style={{
          color: 'var(--color-muted)',
          fontSize: '0.875rem'
        }}>
          {tier.period}
        </div>

        {tier.features.map((feature, index) => (
          <div 
            key={index}
            className={`tier-feature ${!feature.included ? 'disabled' : ''}`}
            style={{
              padding: '0.25rem 0',
              color: feature.included ? 'var(--color-secondary)' : '#adb5bd',
              textDecoration: feature.included ? 'none' : 'line-through'
            }}
          >
            <i 
              className='material-icons me-2'
              style={{ 
                fontSize: '16px',
                color: feature.included ? 'var(--color-success)' : '#ced4da'
              }}
            >
              {feature.included ? 'check_circle' : 'cancel'}
            </i>
            {feature.name}
          </div>
        ))}

        <button 
          className={`btn w-100 mt-3 ${
            isSelected ? 'btn-primary' : 'btn-outline-primary'
          }`}
        >
          {isSelected ? 'Seleccionado' : 'Seleccionar'}
        </button>
      </div>

      <style jsx>{`
        .tier-badge.tier-basic {
          background-color: #e9ecef;
          color: #495057;
        }
        
        .tier-badge.tier-standard {
          background-color: #cff4fc;
          color: #055160;
        }
        
        .tier-badge.tier-premium {
          background-color: #fff3cd;
          color: #664d03;
        }
        
        .tier-badge.tier-vip {
          background: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
          color: #212529;
        }
        
        .tier-card:hover {
          border-color: #ced4da !important;
          background-color: #f8f9fa !important;
        }
        
        .tier-card.selected:hover {
          border-color: var(--color-primary) !important;
          background-color: rgba(3, 14, 39, 0.05) !important;
        }
      `}</style>
    </>
  );
}