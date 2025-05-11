// src/components/layout/user-nav.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Settings, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

interface UserNavProps {
  iconOnly?: boolean;
}

export default function UserNav({ iconOnly = false }: UserNavProps) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" className={cn("relative h-8 w-full justify-start gap-2 p-1", iconOnly ? "w-8 justify-center p-0" : "")} disabled>
        <Loader2 className={cn("h-5 w-5 animate-spin", iconOnly ? "" : "mr-2")} />
        {!iconOnly && <span className="text-sm">Loading...</span>}
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon" : "default"} asChild>
        <Link href="/login">
          <LogIn className={iconOnly ? 'h-5 w-5' : 'mr-2 h-4 w-4'} />
          {!iconOnly && <span>Login</span>}
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("relative h-auto p-1 justify-start gap-2", iconOnly ? "w-8 justify-center p-0 h-8" : "w-full")}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!iconOnly && (
            <div className="flex flex-col space-y-0.5 items-start">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
           )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
           {user.isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/products">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
