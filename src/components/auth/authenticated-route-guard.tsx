'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthenticatedRouteGuardProps {
  children: ReactNode;
}

export function AuthenticatedRouteGuard({ children }: AuthenticatedRouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // If not loading and no user, redirect to login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,0px))] p-4"> {/* Adjust min-h if header exists */}
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  // Fallback: user is null and not loading (being redirected)
  // Render a minimal loading state or null until redirection completes.
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,0px))] p-4">
        <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-12 w-full" />
            <p className="text-center text-muted-foreground">Redirecting to login...</p>
            <Skeleton className="h-10 w-1/2 mx-auto" />
        </div>
    </div>
  );
}
