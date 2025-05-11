import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Leaf, ShoppingCart, Package, User, LogIn, ShieldCheck, History, BarChartHorizontal } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/layout/user-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/detect" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">CottonCare</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Detect Disease">
                <Link href="/detect">
                  <BarChartHorizontal />
                  <span>Detect Disease</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Products">
                <Link href="/products">
                  <Package />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Cart">
                <Link href="/cart">
                  <ShoppingCart />
                  <span>Cart</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Order History">
                <Link href="/orders">
                  <History />
                  <span>Order History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Admin Links - Conditionally render based on auth/role - UserNav now handles admin link based on context */}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
          <UserNav />
        </SidebarFooter>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border hidden group-data-[collapsible=icon]:block">
          <UserNav iconOnly={true} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
          <SidebarTrigger />
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
