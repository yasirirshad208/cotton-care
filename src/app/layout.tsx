import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context'; // Import CartProvider
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CottonCare',
  description: 'Detect cotton diseases and get pesticide recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          geistSans.variable
        )}
        suppressHydrationWarning 
      >
      <Suspense fallback={<div className="text-center md:mt-20 mt-12"><span className="loader"></span></div>}>
        <AuthProvider>
          <CartProvider> {/* Wrap with CartProvider */}
            <SidebarProvider>
              {children}
            </SidebarProvider>
            <Toaster />
          </CartProvider>
        </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
