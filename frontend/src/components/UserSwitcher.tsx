import React, { useState } from 'react';
import { useUser, User } from '../contexts/UserContext';

interface UserSwitcherProps {
  className?: string;
}

function UserSwitcher({ className = '' }: UserSwitcherProps) {
  const { currentUser, setCurrentUser, users } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`user-switcher ${className}`}>
      <div className="user-switcher-header">
        <h3>👤 Current User</h3>
      </div>

      <div className="user-switcher-dropdown">
        <button 
          className="user-switcher-trigger"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
        >
          <div className="user-info">
            <span className="user-avatar">{currentUser.avatar}</span>
            <div className="user-details">
              <div className="user-name">{currentUser.name}</div>
            </div>
          </div>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="user-switcher-menu">
            <div className="user-switcher-menu-header">
              Switch User Profile
            </div>
            {users.map((user) => (
              <button
                key={user.id}
                className={`user-option ${currentUser.id === user.id ? 'active' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <span className="user-avatar">{user.avatar}</span>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-description">{user.description}</div>
                </div>
                {currentUser.id === user.id && (
                  <span className="current-indicator">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="user-switcher-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default UserSwitcher;
