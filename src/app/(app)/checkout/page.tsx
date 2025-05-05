'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, PackageCheck, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Mock cart total - Replace with actual calculation from cart state
const MOCK_SUBTOTAL = 33.99; // Example: (15.99 * 2) + 18.00
const MOCK_SHIPPING_COST = 7.99;
const MOCK_TOTAL = MOCK_SUBTOTAL + MOCK_SHIPPING_COST;

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required').regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  phoneNumber: z.string().min(10, 'Valid phone number is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

const paymentSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Card number is too short')
    .max(19, 'Card number is too long')
    .regex(/^[0-9]+$/, 'Card number must contain only digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/, 'Invalid expiry date (MM/YY or MM/YYYY)'),
  cvc: z.string().min(3, 'CVC must be 3 or 4 digits').max(4, 'CVC must be 3 or 4 digits').regex(/^\d{3,4}$/, 'Invalid CVC'),
  nameOnCard: z.string().min(2, 'Name on card is required'),
});

const FormSchema = z.object({
  shippingAddress: addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['creditCard', 'paypal', 'googlePay'], {
      required_error: "You need to select a payment method.",
  }),
  paymentDetails: paymentSchema, // Assuming CC is always the primary for now
}).refine(data => data.billingSameAsShipping || !!data.billingAddress, {
  message: 'Billing address is required if different from shipping',
  path: ['billingAddress'], // Point error to the billing address section
});


export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false); // Simulate loading/processing
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      billingSameAsShipping: true,
       paymentMethod: 'creditCard', // Default selection
       // Prefill example data - remove in production
       // shippingAddress: {
       //    fullName: "Test User",
       //    addressLine1: "123 Cotton Row",
       //    city: "Farmville",
       //    state: "TX",
       //    zipCode: "75001",
       //    phoneNumber: "1234567890"
       // },
       // paymentDetails: {
       //    cardNumber: "4111111111111111",
       //    expiryDate: "12/25",
       //    cvc: "123",
       //    nameOnCard: "Test User"
       // }
    },
  });

   const billingSameAsShipping = form.watch('billingSameAsShipping');


  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
    setIsLoading(true);
    console.log('Checkout Data:', data);

    // Simulate API call for order placement
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Handle potential errors during API call here

    setIsLoading(false);
    setIsOrderPlaced(true);
    toast({
      title: 'Order Placed Successfully!',
      description: 'Thank you for your purchase. Your order is being processed.',
      variant: 'default', // Use default (greenish in our theme) for success
    });

    // Redirect to order confirmation or history page after a short delay
    setTimeout(() => {
       // TODO: Redirect to a proper order confirmation page /orders/[orderId]
       router.push('/orders');
    }, 2000);
  };

   // If order is placed, show confirmation message
   if (isOrderPlaced) {
       return (
           <div className="container mx-auto py-16 px-4 md:px-6 flex flex-col items-center justify-center text-center">
               <PackageCheck className="h-24 w-24 text-green-600 mb-6 animate-bounce" />
               <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
               <p className="text-muted-foreground mb-6 max-w-md">
                   Your order has been confirmed and will be shipped soon. You can track its progress in your order history.
               </p>
               <Button asChild>
                   <Link href="/orders">View Orders</Link>
               </Button>
                <style jsx>{`
                    @keyframes bounce {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-10px); }
                    }
                    .animate-bounce {
                      animation: bounce 1s ease-in-out;
                    }
                 `}</style>
           </div>
       );
   }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary"/> Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="shippingAddress.fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.phoneNumber" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.addressLine1" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.addressLine2" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.state" render={({ field }) => ( <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="shippingAddress.zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
               <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <div className="flex items-center space-x-2 pt-2">
                       <FormField control={form.control} name="billingSameAsShipping" render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                  <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      id="billingSameAsShipping"
                                  />
                              </FormControl>
                              <FormLabel htmlFor="billingSameAsShipping" className="font-normal">
                                  Same as shipping address
                              </FormLabel>
                           </FormItem>
                       )} />
                   </div>
               </CardHeader>
               {!billingSameAsShipping && (
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-6">
                      {/* TODO: Add Billing Address Fields Here, similar to Shipping */}
                      <p className="text-muted-foreground md:col-span-2">Please enter your billing address details.</p>
                       <FormField control={form.control} name="billingAddress.fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       {/* ... other billing fields ... */}
                       <FormField control={form.control} name="billingAddress.zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
               )}
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary"/> Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="creditCard" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Credit Card
                              </FormLabel>
                            </FormItem>
                            {/* Add other payment methods if needed */}
                            {/* <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="paypal" /></FormControl>
                              <FormLabel className="font-normal">PayPal</FormLabel>
                            </FormItem> */}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Credit Card Details */}
                 {form.watch('paymentMethod') === 'creditCard' && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                       <FormField control={form.control} name="paymentDetails.nameOnCard" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="paymentDetails.cardNumber" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Card Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="paymentDetails.expiryDate" render={({ field }) => ( <FormItem><FormLabel>Expiry Date (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="paymentDetails.cvc" render={({ field }) => ( <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-md"> {/* Make summary sticky */}
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* TODO: Display actual cart items here */}
                <div className="flex justify-between text-sm text-muted-foreground">
                   <span>Neem Oil Spray x 2</span>
                   <span>${(15.99 * 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                   <span>Copper Fungicide x 1</span>
                   <span>${(18.00 * 1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${MOCK_SUBTOTAL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${MOCK_SHIPPING_COST.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${MOCK_TOTAL.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                     <>
                        <CreditCard className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                     </>
                  ) : (
                     <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Place Order
                     </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Need Checkbox for Billing Address toggle
import { Checkbox } from "@/components/ui/checkbox"
