// src/components/auth/auth-guard.tsx
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // Or any loading component

interface AuthGuardProps {
  children: ReactNode;
  role?: 'admin'; // Extend with more roles if needed
}

export function AuthGuard({ children, role }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // If not logged in, redirect to login page, preserving the intended destination
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (role === 'admin' && !user.isAdmin) {
        // If logged in but not an admin and trying to access admin route
        router.push('/detect'); // Or an "Access Denied" page
      }
    }
  }, [user, isLoading, role, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  // Conditions for rendering children:
  // 1. User is logged in.
  // 2. If a role is specified, the user must have that role.
  if (user && (!role || (role === 'admin' && user.isAdmin))) {
    return <>{children}</>;
  }

  // Fallback for scenarios where useEffect hasn't redirected yet,
  // or if there's a brief moment before redirection.
  // This prevents rendering children if conditions aren't met.
  return null;
}
