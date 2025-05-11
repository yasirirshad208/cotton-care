// src/app/(app)/settings/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, Palette, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
   const { toast } = useToast();

   // Mock settings state - replace with actual state management/API calls
   const [settings, setSettings] = React.useState({
       emailNotifications: true,
       darkMode: false, // Assuming theme switching logic exists elsewhere or is handled by OS preference
   });

   const handleSettingChange = (key: keyof typeof settings, value: any) => {
       setSettings(prev => ({ ...prev, [key]: value }));
   };

   const handleSaveChanges = () => {
       // Simulate saving settings
       console.log("Saving settings:", settings);
       toast({
           title: "Settings Saved",
           description: "Your preferences have been updated.",
       });
   };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Card className="max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/> Notifications</CardTitle>
           <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                       Receive updates about your orders and promotions via email.
                    </span>
                </Label>
                <Switch
                   id="email-notifications"
                   checked={settings.emailNotifications}
                   onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                 />
            </div>
             {/* Add more notification options if needed (e.g., SMS, push) */}
        </CardContent>

        <Separator />

         <CardHeader>
           <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/> Security</CardTitle>
           <CardDescription>Manage your account security settings.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           {/* Example: Change Password */}
           <div className="space-y-2">
               <Label htmlFor="current-password">Current Password</Label>
               <Input id="current-password" type="password" />
           </div>
            <div className="space-y-2">
               <Label htmlFor="new-password">New Password</Label>
               <Input id="new-password" type="password" />
           </div>
           <Button variant="outline">Change Password</Button>
           {/* Add other security features like 2FA if applicable */}
         </CardContent>

        {/* Theme settings could go here if you implement manual theme switching */}
        {/* <Separator />
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
               <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                     Enable dark theme for the application.
                  </span>
               </Label>
               <Switch
                 id="dark-mode"
                 checked={settings.darkMode}
                 onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
               />
           </div>
        </CardContent> */}

         <Separator />

         <CardContent className="pt-6">
            <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
               <Save className="mr-2 h-4 w-4" /> Save Preferences
             </Button>
         </CardContent>

      </Card>
    </div>
  );
}
