// src/app/(app)/profile/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth to get user data
import { AuthenticatedRouteGuard } from '@/components/auth/authenticated-route-guard';
import { Skeleton } from '@/components/ui/skeleton';


function ProfilePageContent() {
   const { user, isLoading } = useAuth(); // Get user from context

   if (isLoading) {
       return (
           <div className="container mx-auto py-8 px-4 md:px-6">
               <Card className="max-w-2xl mx-auto shadow-lg">
                   <CardHeader className="text-center">
                       <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
                       <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
                       <Skeleton className="h-4 w-3/4 mx-auto" />
                   </CardHeader>
                   <Separator />
                   <CardContent className="p-6 space-y-4">
                       <Skeleton className="h-6 w-1/3 mb-2" />
                       <Skeleton className="h-5 w-full mb-2" />
                       <Skeleton className="h-5 w-full" />
                       <Separator className="my-6" />
                       <Skeleton className="h-6 w-1/3 mb-2" />
                       <Skeleton className="h-5 w-full mb-1" />
                       <Skeleton className="h-5 w-2/3" />
                       <Separator className="my-6" />
                       <Skeleton className="h-10 w-full" />
                   </CardContent>
               </Card>
           </div>
       );
   }

  if (!user) {
    // This should ideally be handled by AuthenticatedRouteGuard redirecting
    // But as a fallback:
    return <div className="container mx-auto py-8 px-4 md:px-6 text-center">User not found. Please log in.</div>;
  }

  // User data from AuthContext
  const currentUser = {
    name: user.name,
    email: user.email,
    phone: user.phone || 'Not Provided', // Assuming phone can be optional in your User type
    avatarUrl: user.avatarUrl || `https://picsum.photos/100/100?random=${user.id}`, // Fallback if no avatar
    address: user.address, // Assuming address structure exists on user object
    isAdmin: user.isAdmin,
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
           <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
             <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar large" />
             <AvatarFallback className="text-3xl">{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
           </Avatar>
          <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
          <CardDescription>{currentUser.email}</CardDescription>
           {currentUser.isAdmin && <Badge variant="secondary" className="mt-2 w-fit mx-auto">Admin</Badge>}
        </CardHeader>
        <Separator />
        <CardContent className="p-6 space-y-4">
           <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
           <div className="flex items-center gap-3 text-sm">
               <Mail className="w-4 h-4 text-muted-foreground" />
               <span>{currentUser.email}</span>
           </div>
           <div className="flex items-center gap-3 text-sm">
               <Phone className="w-4 h-4 text-muted-foreground" />
               <span>{currentUser.phone}</span>
           </div>

           <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-2">Default Shipping Address</h3>
            {currentUser.address ? (
               <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                     <p>{currentUser.address.line1}</p>
                     {currentUser.address.line2 && <p>{currentUser.address.line2}</p>}
                     <p>{currentUser.address.city}, {currentUser.address.state} {currentUser.address.zip}</p>
                  </div>
               </div>
            ) : (
               <p className="text-sm text-muted-foreground">No default address set.</p>
            )}


            <Separator className="my-6" />

           <Button variant="outline" className="w-full" asChild>
             <Link href="/profile/edit"> {/* Assuming an edit page exists */}
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
             </Link>
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthenticatedRouteGuard>
      <ProfilePageContent />
    </AuthenticatedRouteGuard>
  );
}
