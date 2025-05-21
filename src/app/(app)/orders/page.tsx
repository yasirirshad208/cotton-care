
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { History, Package, CalendarDays, Truck, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns'; 
import { AuthenticatedRouteGuard } from '@/components/auth/authenticated-route-guard';
import type { Order, OrderItem } from '@/services/order-api'; // Import Order and OrderItem types
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_ORDERS_KEY = 'cottonCareOrders';

const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'Delivered':
      return 'default'; // Greenish
    case 'Shipped':
      return 'secondary'; // Bluish/Grayish
    case 'Processing':
      return 'outline'; // Default outline
    case 'Cancelled':
      return 'destructive'; // Red
    default:
      return 'secondary';
  }
};


function OrderHistoryPageContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders([]); // No orders found
      }
    } catch (error) {
      console.error("Failed to load orders from local storage:", error);
      toast({
        title: "Error Loading Orders",
        description: "Could not retrieve your order history.",
        variant: "destructive"
      });
      setOrders([]); // Set to empty on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  if (isLoading) {
     return (
         <div className="container mx-auto py-8 px-4 md:px-6">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="space-y-4">
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
            </div>
         </div>
     )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <History className="h-7 w-7 text-primary" /> Order History
      </h1>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
             <Receipt className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {orders.map((order) => (
            <AccordionItem value={order.id} key={order.id} className="border rounded-lg overflow-hidden shadow-sm bg-card">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-wrap justify-between items-center w-full gap-4">
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="font-medium text-sm sm:text-base">Order #{order.id}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                         <CalendarDays className="h-3.5 w-3.5"/> {format(new Date(order.orderDate), 'PPP')} {/* Format date */}
                      </span>
                   </div>
                  <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                     <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs px-2.5 py-0.5">
                         {order.status === 'Shipped' && <Truck className="h-3 w-3 mr-1"/>}
                         {order.status === 'Delivered' && <Package className="h-3 w-3 mr-1"/>}
                         {order.status}
                     </Badge>
                     <span className="font-semibold text-sm sm:text-base">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0 bg-muted/20">
                <div className="mt-4 space-y-4">
                   <div>
                      <h4 className="font-semibold mb-2">Items Ordered:</h4>
                       <Table>
                         <TableHeader>
                           <TableRow>
                             <TableHead className="w-[80px]">Item</TableHead>
                             <TableHead>Product</TableHead>
                             <TableHead className="text-center">Qty</TableHead>
                             <TableHead className="text-right">Price</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {order.items.map((item: OrderItem) => ( // Use imported OrderItem
                             <TableRow key={item.productId}>
                               <TableCell>
                                 <Image
                                   src={item.image || 'https://placehold.co/40x40.png'} // Provide fallback for image
                                   alt={item.name}
                                   width={40}
                                   height={40}
                                   className="rounded object-cover aspect-square"
                                   data-ai-hint="product thumbnail order history"
                                   unoptimized={item.image?.startsWith('https://placehold.co')}
                                 />
                               </TableCell>
                               <TableCell>
                                  <Link href={`/products/${item.productId}`} className="hover:text-primary font-medium">
                                      {item.name}
                                  </Link>
                               </TableCell>
                               <TableCell className="text-center">{item.quantity}</TableCell>
                               <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>
                   </div>
                   <div>
                      <h4 className="font-semibold mb-1">Shipping Address:</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.addressLine1}<br />
                        {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.phoneNumber}
                      </p>
                   </div>
                    <div className="flex justify-end gap-2 mt-4">
                       <Button variant="outline" size="sm">View Invoice</Button>
                       {/* Cancel order logic would typically involve an API call to update status in a real backend */}
                       {order.status === 'Processing' && <Button variant="destructive" size="sm" disabled>Cancel Order</Button>}
                   </div>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <AuthenticatedRouteGuard>
      <OrderHistoryPageContent />
    </AuthenticatedRouteGuard>
  );
}

