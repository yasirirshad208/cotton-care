// src/contexts/auth-context.tsx
'use client';

import type { User } from '@/services/user-api';
import { login as apiLogin, getUserById } from '@/services/user-api';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check for stored user ID (e.g., from localStorage)
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const fetchedUser = await getUserById(storedUserId);
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Potentially clear stored user if fetching fails
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiLogin(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.name}!` });
        // Redirect based on role or to a default page
        if (loggedInUser.isAdmin) {
          router.push('/admin/products');
        } else {
          router.push('/detect');
        }
        return true;
      } else {
        toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: 'Login Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
