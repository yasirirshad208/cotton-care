'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, CreditCard, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthenticatedRouteGuard } from '@/components/auth/authenticated-route-guard';
import { useCartContext } from '@/contexts/cart-context';

function CartPageContent() {
  const { 
    cartItems, 
    isCartLoading, 
    updateItemQuantity, 
    removeItem,
    getCartSubtotal
  } = useCartContext();

   const subtotal = getCartSubtotal();
   const shippingCost = subtotal > 50 || subtotal === 0 ? 0 : 7.99; // Example shipping logic
   const total = subtotal + shippingCost;

   if (isCartLoading) {
      return (
          <div className="container mx-auto py-8 px-4 md:px-6">
             <Skeleton className="h-8 w-1/3 mb-6" />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
             </div>
          </div>
      )
   }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <ShoppingCart className="h-7 w-7 text-primary" /> Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
             <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Product</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Remove</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover aspect-square"
                              data-ai-hint="product thumbnail cart"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/products/${item.id}`} className="hover:text-primary">{item.name}</Link>
                           </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1" // Handled by updateItemQuantity if goes to 0 or less
                              max={item.stock} // Visually indicate max
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                              className="w-16 mx-auto h-8 text-center"
                            />
                             <p className="text-xs text-muted-foreground mt-1">Max: {item.stock}</p>
                          </TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
             </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-20"> {/* Make summary sticky */}
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                   <span>Shipping</span>
                   <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
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
                <Button className="w-full" size="lg" asChild>
                   <Link href="/checkout">
                       <CreditCard className="mr-2 h-5 w-5" />
                       Proceed to Checkout
                   </Link>
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


export default function CartPage() {
  // Cart itself can be viewed without login, but checkout requires it.
  // If we want cart page to be authenticated, wrap CartPageContent with AuthenticatedRouteGuard
  return (
    <AuthenticatedRouteGuard>
      <CartPageContent />
    </AuthenticatedRouteGuard>
  );
}
