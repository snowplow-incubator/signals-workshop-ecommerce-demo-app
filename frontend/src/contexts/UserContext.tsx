import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  segment: string;
  description: string;
}

export interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
}

// Predefined user accounts for the demo
export const PREDEFINED_USERS: User[] = [
  {
    id: 'user_001',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: '👤',
    segment: 'Premium Customer',
    description: 'High-value customer with frequent purchases'
  },
  {
    id: 'b2d4c8e1-9f3a-4b7c-8d2e-1a5f6c9b8e7d',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    avatar: '👩',
    segment: 'New Customer',
    description: 'Recently signed up, exploring products'
  },
  {
    id: 'c5e8a1b4-2d6f-4c9e-7b1a-9e5f2c8d6b3a',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    avatar: '👨',
    segment: 'Regular Customer',
    description: 'Consistent buyer with moderate spending'
  },
  {
    id: 'd9f2b5c8-7a1e-4d3b-6c9f-3e8a1b7d5c2f',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    avatar: '👩‍💼',
    segment: 'VIP Customer',
    description: 'Top-tier customer with exclusive preferences'
  },
  {
    id: 'e1a7d4b9-5c2f-4e8b-9d1c-6f3a8b5e7d4c',
    name: 'Guest User',
    email: 'guest@example.com',
    avatar: '👤',
    segment: 'Anonymous',
    description: 'Browsing without account'
  }
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const savedUser = PREDEFINED_USERS.find(user => user.id === savedUserId);
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    }
    
    // Default to first user if none saved
    if (!savedUserId && PREDEFINED_USERS.length > 0) {
      setCurrentUser(PREDEFINED_USERS[0]);
    }
  }, []);

  // Save user to localStorage when changed
  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUserId', user.id);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('userChanged', { 
      detail: { user } 
    }));
  };

  const value: UserContextType = {
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    users: PREDEFINED_USERS,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
