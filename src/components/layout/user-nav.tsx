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
import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import the cn function

interface UserNavProps {
  iconOnly?: boolean;
}

export default function UserNav({ iconOnly = false }: UserNavProps) {
  // Replace with actual user data and authentication logic
  const user = {
    name: 'Admin User', // Example user
    email: 'admin@example.com',
    avatarUrl: 'https://picsum.photos/100/100', // Example avatar
    isAdmin: true, // Example role
  };
  const isLoggedIn = true; // Example auth status

  if (!isLoggedIn) {
    return (
      <Button variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon" : "default"} asChild>
        <Link href="/login">
          <LogOut className={iconOnly ? 'h-5 w-5' : 'mr-2 h-4 w-4'} />
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
          className={cn("relative h-8 w-full justify-start gap-2", iconOnly ? "w-8 justify-center p-0" : "")}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!iconOnly && (
            <div className="flex flex-col space-y-1 items-start">
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('Logout clicked')}> {/* Replace with actual logout logic */}
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
