import React from 'react';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { useUser } from '../contexts/UserContext';

interface MembershipOffersProps {
  className?: string;
}

function MembershipOffers({ className = '' }: MembershipOffersProps) {
  const { currentUser } = useUser();
  const { attributes, customerTier, isHighValueCustomer, loading } = usePersonalization();

  if (!currentUser || loading) {
    return (
      <div className={`membership-offers ${className}`}>
        <div className="membership-loading">
          <span className="loading-spinner">⏳</span>
          <span>Loading personalization...</span>
        </div>
      </div>
    );
  }

  const getTierInfo = () => {
    switch (customerTier) {
      case 'platinum':
        return {
          icon: '💎',
          title: 'Platinum Member',
          color: '#9C27B0',
          benefits: ['Free same-day delivery', 'Exclusive platinum products', '30% off premium items'],
          offer: 'Enjoy your Platinum privileges!'
        };
      case 'gold':
        return {
          icon: '🥇',
          title: 'Gold Member',
          color: '#FF9800',
          benefits: ['Free 2-day shipping', 'Early access to sales', '20% off selected items'],
          offer: 'Upgrade to Platinum for exclusive benefits!'
        };
      case 'silver':
        return {
          icon: '🥈',
          title: 'Silver Member',
          color: '#607D8B',
          benefits: ['Free shipping on $50+', '10% member discount', 'Birthday rewards'],
          offer: 'Spend $500 more to reach Gold status!'
        };
      case 'bronze':
        return {
          icon: '🥉',
          title: 'Bronze Member',
          color: '#8D6E63',
          benefits: ['Member-only deals', '5% back in rewards', 'Free returns'],
          offer: 'Spend $200 more to reach Silver status!'
        };
      default:
        return {
          icon: '✨',
          title: 'Welcome!',
          color: '#4CAF50',
          benefits: ['Join our membership program', 'Earn rewards on purchases', 'Exclusive member pricing'],
          offer: 'Make your first purchase to unlock rewards!'
        };
    }
  };

  const tierInfo = getTierInfo();
  const totalSpent = attributes?.total_cart_value || 0;
  const nextTierThreshold = getNextTierThreshold();

  function getNextTierThreshold() {
    switch (customerTier) {
      case 'new': return 500;
      case 'bronze': return 500;
      case 'silver': return 2000;
      case 'gold': return 5000;
      default: return null;
    }
  }

  const progressPercentage = nextTierThreshold 
    ? Math.min((totalSpent / nextTierThreshold) * 100, 100)
    : 100;

  return (
    <div className={`membership-offers ${className}`}>
      <div className="membership-header">
        <div className="membership-tier" style={{ color: tierInfo.color }}>
          <span className="tier-icon">{tierInfo.icon}</span>
          <span className="tier-title">{tierInfo.title}</span>
        </div>
        {totalSpent > 0 && (
          <div className="lifetime-value">
            <span className="ltv-label">Lifetime Value:</span>
            <span className="ltv-amount">${totalSpent.toFixed(2)}</span>
          </div>
        )}
      </div>

      {nextTierThreshold && customerTier !== 'platinum' && (
        <div className="tier-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: tierInfo.color 
              }}
            />
          </div>
          <div className="progress-text">
            ${totalSpent.toFixed(2)} / ${nextTierThreshold.toFixed(2)} to next tier
          </div>
        </div>
      )}

      <div className="membership-benefits">
        <h4>Your Benefits:</h4>
        <ul>
          {tierInfo.benefits.map((benefit, index) => (
            <li key={index}>
              <span className="benefit-check">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {isHighValueCustomer && (
        <div className="special-offer">
          <div className="offer-header">
            <span className="offer-icon">🎉</span>
            <span className="offer-title">Exclusive Offer</span>
          </div>
          <div className="offer-content">
            <p>{tierInfo.offer}</p>
            {customerTier === 'platinum' ? (
              <button className="offer-button platinum">
                Browse Exclusive Collection
              </button>
            ) : (
              <button className="offer-button">
                Claim Your Discount
              </button>
            )}
          </div>
        </div>
      )}

      {attributes?.engagement_score && (
        <div className="engagement-stats">
          <div className="stat-item">
            <span className="stat-label">Product Views:</span>
            <span className="stat-value">{attributes.count_product_views || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Items Added:</span>
            <span className="stat-value">{attributes.count_add_to_cart || 0}</span>
          </div>
          {attributes.average_cart_value && (
            <div className="stat-item">
              <span className="stat-label">Avg. Cart:</span>
              <span className="stat-value">${attributes.average_cart_value.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MembershipOffers;
