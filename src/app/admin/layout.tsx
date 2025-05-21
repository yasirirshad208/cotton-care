
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3, Users, Settings, ShieldAlert, Home, PanelLeft } from 'lucide-react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation'; // To close sheet on navigation

// Basic Admin Layout - Can be expanded with more features like search, user info etc.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const navLinks = (
    <>
      <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/detect">
          <Home className="h-4 w-4" /> Main App
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/admin/products">
          <Package className="h-4 w-4" /> Products
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/admin/orders">
          <ShoppingCart className="h-4 w-4" /> Orders
        </Link>
      </Button>
      {/*
      <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/admin/analytics">
          <BarChart3 className="h-4 w-4" /> Analytics
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start gap-2" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/admin/users">
          <Users className="h-4 w-4" /> Users
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start gap-2 mt-auto" asChild onClick={() => setIsSheetOpen(false)}>
        <Link href="/admin/settings">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </Button>
      */}
    </>
  );

  return (
    <AuthGuard role="admin">
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
          <Link href="/admin" className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-primary flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Admin Panel
            </h2>
          </Link>
          <nav className="flex flex-col gap-2">
            {navLinks}
          </nav>
        </aside>

        {/* Mobile and Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Mobile Header with Sidebar Trigger */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs p-4">
                <SheetHeader className="mb-4">
                  <SheetTitle>
                    <Link href="/admin" className="flex items-center gap-2 text-primary" onClick={() => setIsSheetOpen(false)}>
                      <ShieldAlert className="h-5 w-5" /> Admin Panel
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navLinks}
                </nav>
              </SheetContent>
            </Sheet>
             <Link href="/admin" className="text-lg font-semibold text-primary flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Admin
            </Link>
            <div>{/* Placeholder for other mobile header items if needed */}</div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
