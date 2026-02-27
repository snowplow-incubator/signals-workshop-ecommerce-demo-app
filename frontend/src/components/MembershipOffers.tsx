import React from 'react';

interface MembershipOffersProps {
  className?: string;
}

function MembershipOffers({ className = '' }: MembershipOffersProps) {
  return (
    <div className={`membership-offers ${className}`} />
  );
}

export default MembershipOffers;
