import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
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
    id: 'anonymous',
    name: 'Anonymous',
    email: 'anonymous@example.com',
    avatar: '👤',
    description: 'Anonymous user'
  },
  {
    id: 'user_001',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: '👤',
    description: 'High-value customer with frequent purchases'
  },
  {
    id: 'user_002',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    avatar: '👩',
    description: 'Recently signed up, exploring products'
  },
  {
    id: 'user_003',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    avatar: '👨',
    description: 'Consistent buyer with moderate spending'
  },
  {
    id: 'user_004',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    avatar: '👩‍💼',
    description: 'Top-tier customer with exclusive preferences'
  },
  {
    id: 'user_005',
    name: 'Jeremy Johnson',
    email: 'jeremy.johnson@example.com',
    avatar: '👤',
    description: 'New user, browsing the site'
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
