interface TierBadgeProps {
  tier: 'basico' | 'estandar' | 'premium' | 'vip';
  tierName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TierBadge({ tier, tierName, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: { fontSize: '0.65rem', padding: '0.125rem 0.375rem' },
    md: { fontSize: '0.75rem', padding: '0.25rem 0.5rem' },
    lg: { fontSize: '0.875rem', padding: '0.375rem 0.75rem' }
  };

  const sizeStyle = sizeClasses[size];

  return (
    <>
      <span 
        className={`tier-badge tier-${tier}`}
        style={{
          display: 'inline-block',
          borderRadius: '4px',
          fontWeight: '600',
          ...sizeStyle
        }}
      >
        {tierName}
      </span>

      <style jsx>{`
        .tier-badge.tier-basico {
          background-color: #e9ecef;
          color: #495057;
        }
        
        .tier-badge.tier-estandar {
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
      `}</style>
    </>
  );
}