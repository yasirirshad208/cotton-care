// src/contexts/auth-context.tsx
'use client';

import type { User, SignupData } from '@/services/user-api';
import { login as apiLogin, getUserById, signup as apiSignup } from '@/services/user-api';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (signupData: SignupData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const fetchedUser = await getUserById(storedUserId);
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleSuccessfulAuth = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('userId', loggedInUser.id);
    
    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
      router.push(redirectPath);
    } else if (loggedInUser.isAdmin) {
      router.push('/admin/products');
    } else {
      router.push('/detect');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiLogin(email, password);
      if (loggedInUser) {
        toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.name}!` });
        handleSuccessfulAuth(loggedInUser);
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

  const signup = async (signupData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await apiSignup(signupData);
      if (newUser) {
        toast({ title: 'Signup Successful', description: `Welcome, ${newUser.name}! Please log in.` });
        // Redirect to login after signup, optionally with email prefill
        router.push(`/login?email=${encodeURIComponent(newUser.email)}`);
        return true;
      } else {
        // apiSignup might return null if email already exists or other validation fails on mock backend
        toast({ title: 'Signup Failed', description: 'Could not create account. The email might already be in use.', variant: 'destructive' });
        return false;
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({ title: 'Signup Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
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
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
