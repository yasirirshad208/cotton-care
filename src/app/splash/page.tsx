// src/app/splash/page.tsx
'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SplashScreenContent() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/detect'); // Default redirect to detect page
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
      <div className="text-center">
        <Leaf className="mx-auto h-24 w-24 text-primary animate-pulse-custom" />
        <h1 className="mt-4 text-4xl font-bold text-primary">CottonCare</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your partner in healthy cotton farming.
        </p>
      </div>
      {/* It's better to move animations to global CSS or use Tailwind's animation utilities if possible */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-in-out forwards;
        }
        @keyframes pulse-custom { /* Renamed to avoid conflict if Tailwind pulse is used elsewhere */
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-custom {
          animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

function SplashScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Leaf className="mx-auto h-24 w-24 text-primary opacity-75" /> {/* Static icon for loader */}
        <Skeleton className="mt-4 h-10 w-48 mx-auto" /> {/* Skeleton for "CottonCare" */}
        <Skeleton className="mt-2 h-6 w-64 mx-auto" /> {/* Skeleton for subtitle */}
      </div>
    </div>
  );
}

export default function SplashScreen() {
  return (
    <Suspense fallback={<SplashScreenLoader />}>
      <SplashScreenContent />
    </Suspense>
  );
}
