import React, { useState, useEffect } from 'react';
import { useUserAttributes } from '../hooks/useUserAttributes';
import { useUser } from '../contexts/UserContext';

interface UserAttributesProps {
  className?: string;
}

function UserAttributes({ className = '' }: UserAttributesProps) {
  const { currentUser } = useUser();
  
  // Use current user's ID as default
  const effectiveUserId = currentUser?.id;
  
  const { attributes, loading, error, refetch, clearError } = useUserAttributes(effectiveUserId);

  // Auto-fetch when user changes
  useEffect(() => {
    if (currentUser) {
      refetch(effectiveUserId);
    }
  }, [currentUser, effectiveUserId, refetch]);

  const renderAttributeValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const renderAttributes = (attrs: Record<string, Array<any>>) => {
    return Object.entries(attrs).map(([key, value]) => {
      return (
        <div key={key} className="attribute-item">
          <span className="attribute-key">{key}:</span>
          <span className="attribute-value">{renderAttributeValue(value)}</span>
        </div>
      );
    });
  };

  return (
    <div className={`user-attributes ${className}`}>
      <div className="user-attributes-header">
        <h2>🔍 User Attributes</h2>
        <p>Fetch user attributes from the CloudFlare worker</p>
        {currentUser && (
          <div className="current-user-info">
            <span className="current-user-label">Current User:</span>
            <span className="current-user-name">{currentUser.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      {loading && (
        <div className="loading-message">
          <span className="loading-spinner">⏳</span>
          <span>Fetching user attributes...</span>
        </div>
      )}

      {attributes && !loading && (
        <div className="attributes-display">
          <div className="attributes-header">
            <h3>Attributes for User: {currentUser?.id}</h3>
          </div>
          <div className="attributes-content">
            {renderAttributes(attributes)}
          </div>
        </div>
      )}

      {!attributes && !loading && !error && (
        <div className="no-data-message">
          <span>No attributes data available.</span>
        </div>
      )}
    </div>
  );
}

export default UserAttributes;
