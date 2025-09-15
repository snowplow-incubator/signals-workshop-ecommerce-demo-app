import React from 'react';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { useUser } from '../contexts/UserContext';

interface CartInsightsProps {
  className?: string;
}

function CartInsights({ className = '' }: CartInsightsProps) {
  const { currentUser } = useUser();
  const { attributes, customerTier, loading } = usePersonalization();

  if (!currentUser || loading) {
    return (
      <div className={`cart-insights ${className}`}>
        <div className="insights-loading">
          <span className="loading-spinner">⏳</span>
          <span>Loading insights...</span>
        </div>
      </div>
    );
  }

  const cartItems = attributes?.count_add_to_cart || 0;
  const totalValue = attributes?.sum_transaction_value_ltv || 0;
  const avgCartValue = attributes?.average_cart_value || 0;
  const productViews = attributes?.count_product_views || 0;

  // Calculate conversion rate
  const conversionRate = productViews > 0 ? (cartItems / productViews) * 100 : 0;

  // Determine insights based on behavior
  const getShoppingInsights = () => {
    const insights = [];

    if (conversionRate > 20) {
      insights.push({
        type: 'positive',
        icon: '🎯',
        message: 'You\'re a decisive shopper!',
        detail: `${conversionRate.toFixed(1)}% conversion rate`
      });
    } else if (conversionRate > 10) {
      insights.push({
        type: 'neutral',
        icon: '🤔',
        message: 'You like to browse before buying',
        detail: `${conversionRate.toFixed(1)}% conversion rate`
      });
    } else if (productViews > 5) {
      insights.push({
        type: 'suggestion',
        icon: '💡',
        message: 'Need help deciding?',
        detail: 'Try our product comparison tool'
      });
    }

    if (avgCartValue > 100) {
      insights.push({
        type: 'positive',
        icon: '💰',
        message: 'You appreciate quality items',
        detail: `Average cart: $${avgCartValue.toFixed(2)}`
      });
    }

    if (cartItems >= 5) {
      insights.push({
        type: 'positive',
        icon: '🛒',
        message: 'Active shopper',
        detail: `${cartItems} items added recently`
      });
    }

    return insights;
  };

  const insights = getShoppingInsights();

  // Personalized recommendations based on behavior
  const getRecommendations = () => {
    const recommendations = [];

    if (customerTier === 'new' && cartItems === 0) {
      recommendations.push({
        title: 'Welcome Offer',
        message: 'Get 15% off your first purchase',
        action: 'Browse Featured Items',
        type: 'welcome'
      });
    }

    if (conversionRate < 10 && productViews > 10) {
      recommendations.push({
        title: 'Decision Helper',
        message: 'Having trouble choosing? Check out our bestsellers',
        action: 'View Bestsellers',
        type: 'help'
      });
    }

    if (avgCartValue > 50 && customerTier !== 'Gold') {
      const savings = (avgCartValue * 0.1).toFixed(2);
      recommendations.push({
        title: 'Membership Savings',
        message: `You could save $${savings} per order with ${customerTier === 'Silver' ? 'Gold' : 'Silver'} membership`,
        action: 'Learn More',
        type: 'upgrade'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className={`cart-insights ${className}`}>
      <div className="insights-header">
        <h3>🔍 Shopping Insights</h3>
        <p>Personalized based on your activity</p>
      </div>

      {attributes && (
        <div className="shopping-stats">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <div className="stat-number">{productViews}</div>
                <div className="stat-label">Products Viewed</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <div className="stat-number">{cartItems}</div>
                <div className="stat-label">Items Added</div>
              </div>
            </div>
            
            {totalValue > 0 && (
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-number">${totalValue.toFixed(0)}</div>
                  <div className="stat-label">Total Value</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="behavior-insights">
          <h4>Your Shopping Style</h4>
          {insights.map((insight, index) => (
            <div key={index} className={`insight-item ${insight.type}`}>
              <span className="insight-icon">{insight.icon}</span>
              <div className="insight-content">
                <div className="insight-message">{insight.message}</div>
                <div className="insight-detail">{insight.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Personalized for You</h4>
          {recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-card ${rec.type}`}>
              <div className="rec-content">
                <div className="rec-title">{rec.title}</div>
                <div className="rec-message">{rec.message}</div>
              </div>
              <button className="rec-action">{rec.action}</button>
            </div>
          ))}
        </div>
      )}

      {attributes?.main_interest && (
        <div className="interest-note">
          <span className="interest-icon">❤️</span>
          <span>Showing more {attributes.main_interest} products for you</span>
        </div>
      )}
    </div>
  );
}

export default CartInsights;
