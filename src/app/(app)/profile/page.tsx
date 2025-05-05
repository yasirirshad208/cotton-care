// src/app/(app)/profile/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';

// Mock user data - Replace with actual user data from auth context/API
const MOCK_USER = {
  name: 'Alice Smith',
  email: 'alice.smith@example.com',
  phone: '555-1111',
  avatarUrl: 'https://picsum.photos/100/100?random=101', // Example avatar
  address: {
     line1: '123 Cotton Row',
     city: 'Farmville',
     state: 'TX',
     zip: '75001',
   },
   isAdmin: false, // Example role
};

export default function ProfilePage() {
   // TODO: Fetch user data based on authentication

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
           <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
             <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} data-ai-hint="user avatar large" />
             <AvatarFallback className="text-3xl">{MOCK_USER.name?.charAt(0).toUpperCase()}</AvatarFallback>
           </Avatar>
          <CardTitle className="text-2xl">{MOCK_USER.name}</CardTitle>
          <CardDescription>{MOCK_USER.email}</CardDescription>
           {MOCK_USER.isAdmin && <Badge variant="secondary" className="mt-2 w-fit mx-auto">Admin</Badge>}
        </CardHeader>
        <Separator />
        <CardContent className="p-6 space-y-4">
           <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
           <div className="flex items-center gap-3 text-sm">
               <Mail className="w-4 h-4 text-muted-foreground" />
               <span>{MOCK_USER.email}</span>
           </div>
           <div className="flex items-center gap-3 text-sm">
               <Phone className="w-4 h-4 text-muted-foreground" />
               <span>{MOCK_USER.phone || 'Not Provided'}</span>
           </div>

           <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-2">Default Shipping Address</h3>
            {MOCK_USER.address ? (
               <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                     <p>{MOCK_USER.address.line1}</p>
                     <p>{MOCK_USER.address.city}, {MOCK_USER.address.state} {MOCK_USER.address.zip}</p>
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

// Need Badge component
import { Badge } from '@/components/ui/badge';

