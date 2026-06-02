import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for frontend-only auth
const MOCK_USERS = [
  { id: 'U1', name: 'HKBKCE-Principal Office', email: 'admin@hkbkce.edu.in', password: 'admin123', role: 'Admin', initials: 'HP' },
  { id: 'U2', name: 'Priya Sharma', email: 'priya.s@hkbkce.edu.in', password: 'staff123', role: 'Admission Staff', initials: 'PS' },
  { id: 'U3', name: 'Mohan Rao', email: 'mohan.r@hkbkce.edu.in', password: 'faculty123', role: 'Faculty', initials: 'MR' },
  { id: 'U4', name: 'Sneha Patil', email: 'sneha.p@hkbkce.edu.in', password: 'viewer123', role: 'Viewer', initials: 'SP' },
];

const STORAGE_KEY = 'hkbkce_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === 'U1' && (parsed.name === 'Mr. Mansoor' || parsed.initials === 'MM')) {
          parsed.name = 'HKBKCE-Principal Office';
          parsed.initials = 'HP';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return false;

    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      initials: found.initials,
    };

    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
