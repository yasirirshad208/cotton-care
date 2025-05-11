import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3, Users, Settings, ShieldAlert } from 'lucide-react';
import { AuthGuard } from '@/components/auth/auth-guard';

// Basic Admin Layout - Can be expanded with more features like search, user info etc.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <div className="flex min-h-screen w-full bg-muted/40">
        <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
          <nav className="flex flex-col gap-2">
            <Link href="/admin/products" className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-primary flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Admin Panel
              </h2>
            </Link>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/admin/products">
                <Package className="h-4 w-4" /> Products
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-4 w-4" /> Orders
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/admin/analytics">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4" /> Users
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 mt-auto" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Mobile Nav could be added here with a Sheet component */}
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
