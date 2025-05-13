'use client'; // Add this directive

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
import { Leaf, ShoppingCart, Package, User, LogIn, ShieldCheck, History, BarChartHorizontal, PlusCircle, SettingsIcon, LineChart, Users, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import UserNav from '@/components/layout/user-nav';
import { useAuth } from '@/contexts/auth-context'; 

// Wrapper component to use the hook
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href={user ? "/detect" : "/"} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Leaf className="h-8 w-8 text-sidebar-primary" />
            <span className="font-semibold text-xl text-sidebar-primary group-data-[collapsible=icon]:hidden">CottonCare</span>
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
            { user && (
              <>
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
              </>
            )}
            {user?.isAdmin && (
              <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Admin Dashboard">
                        <Link href="/admin">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Products">
                    <Link href="/admin/products">
                      <Package />
                      <span>Manage Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Add Product">
                    <Link href="/admin/products/new">
                      <PlusCircle />
                      <span>Add Product</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Orders">
                    <Link href="/admin/orders">
                      <ShoppingCart />
                      <span>Manage Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Users (Placeholder)">
                    <Link href="/admin/users">
                      <Users />
                      <span>Manage Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Analytics (Placeholder)">
                    <Link href="/admin/analytics">
                      <LineChart />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin: Settings (Placeholder)">
                    <Link href="/admin/settings">
                      <SettingsIcon />
                      <span>Admin Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
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


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <AppLayoutContent>{children}</AppLayoutContent>
  );
}
