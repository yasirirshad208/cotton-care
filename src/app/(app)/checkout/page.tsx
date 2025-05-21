
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
import { CreditCard, PackageCheck, Truck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from "@/components/ui/checkbox"
import Link from 'next/link';
import { AuthenticatedRouteGuard } from '@/components/auth/authenticated-route-guard';
import { useCartContext } from '@/contexts/cart-context'; // Import cart context
import { useAuth } from '@/contexts/auth-context'; // Import auth context for user details
import type { PlaceOrderInput, Order } from '@/services/order-api'; // Import PlaceOrderInput and Order
import { placeOrder as apiPlaceOrder } from '@/services/order-api'; // Import placeOrder API

const LOCAL_STORAGE_ORDERS_KEY = 'cottonCareOrders';

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
  paymentMethod: z.enum(['creditCard', 'paypal', 'googlePay'], { // Paypal and GooglePay are placeholders
      required_error: "You need to select a payment method.",
  }),
  paymentDetails: paymentSchema,
}).refine(data => data.billingSameAsShipping || !!data.billingAddress, {
  message: 'Billing address is required if different from shipping',
  path: ['billingAddress'],
});


function CheckoutPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Get user for prefill and customerId
  const { cartItems, getCartSubtotal, clearCart, isCartLoading } = useCartContext();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      billingSameAsShipping: true,
      paymentMethod: 'creditCard',
      shippingAddress: { // Prefill from user if available
        fullName: user?.name || '',
        addressLine1: user?.address?.line1 || '',
        addressLine2: user?.address?.line2 || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zip || '',
        phoneNumber: user?.phone || '',
      },
      paymentDetails: {
        nameOnCard: user?.name || '',
        cardNumber: '',
        expiryDate: '',
        cvc: ''
      }
    },
  });

   const billingSameAsShipping = form.watch('billingSameAsShipping');

  const subtotal = getCartSubtotal();
  const shippingCost = subtotal > 50 || subtotal === 0 ? 0 : 7.99;
  const total = subtotal + shippingCost;

  useEffect(() => {
    // If cart is empty and not loading, redirect to products page or cart page
    if (!isCartLoading && cartItems.length === 0 && !isOrderPlaced) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "default"
      });
      router.push('/products');
    }
  }, [cartItems, isCartLoading, router, toast, isOrderPlaced]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to place an order.", variant: "destructive"});
        router.push('/login?redirect=/checkout');
        return;
    }
    if (cartItems.length === 0) {
        toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    
    const orderInput: PlaceOrderInput = {
        customerId: user.id,
        items: cartItems.map(item => ({
            productId: item.id,
            price: item.price,
            quantity: item.quantity,
        })),
        shippingAddress: data.billingSameAsShipping ? data.shippingAddress : data.billingAddress!,
        total: total,
    };

    try {
        const newOrder = await apiPlaceOrder(orderInput); // Call the actual API service
        
        // Save order to local storage
        try {
          const existingOrdersString = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
          const existingOrders: Order[] = existingOrdersString ? JSON.parse(existingOrdersString) : [];
          existingOrders.unshift(newOrder); // Add new order to the beginning
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(existingOrders));
        } catch (storageError) {
          console.error("Failed to save order to local storage:", storageError);
          toast({
            title: "Local Storage Error",
            description: "Your order was placed, but could not be saved to your local history.",
            variant: "default" // Not destructive, as order itself is placed
          });
        }
        
        setIsOrderPlaced(true);
        clearCart(); // Clear cart from local storage
        toast({
          title: 'Order Placed Successfully!',
          description: 'Thank you for your purchase. Your order is being processed.',
          variant: 'default', 
        });

        setTimeout(() => {
           router.push('/orders'); // Navigate to order history page
        }, 2000);

    } catch (error) {
        console.error('Failed to place order:', error);
        toast({ title: 'Order Placement Failed', description: 'There was an error placing your order. Please try again.', variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
    }
  };

   if (isCartLoading) {
     return (
       <div className="container mx-auto py-8 px-4 md:px-6">
         <Skeleton className="h-8 w-1/3 mb-6" />
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
             <Skeleton className="h-64 w-full" />
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-72 w-full" />
           </div>
           <Skeleton className="h-96 w-full" />
         </div>
       </div>
     );
   }

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
          <div className="lg:col-span-2 space-y-6">
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
                       <p className="text-muted-foreground md:col-span-2">Please enter your billing address details.</p>
                       <FormField control={form.control} name="billingAddress.fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.phoneNumber" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.addressLine1" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.addressLine2" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.state" render={({ field }) => ( <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                       <FormField control={form.control} name="billingAddress.zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </CardContent>
               )}
            </Card>

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
                            {/* Placeholder for other payment methods if implemented */}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-md"> 
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                     <span>{item.name} x {item.quantity}</span>
                     <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {cartItems.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 && subtotal > 0 ? 'Free' : (subtotal === 0 ? '$0.00' : `$${shippingCost.toFixed(2)}`)}</span>
                </div>
                {subtotal > 0 && subtotal <= 50 && (
                   <p className="text-xs text-muted-foreground">Add ${ (50.01 - subtotal).toFixed(2) } more for free shipping.</p>
                 )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || cartItems.length === 0}>
                  {isSubmitting ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default function CheckoutPage() {
  return (
    <AuthenticatedRouteGuard>
      <CheckoutPageContent />
    </AuthenticatedRouteGuard>
  );
}

