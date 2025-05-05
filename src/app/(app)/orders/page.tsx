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
import { format } from 'date-fns'; // For date formatting

// Mock order data - Replace with actual API call/data fetching
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderDate: string; // ISO string format
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: string; // Simple string for now
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD12345',
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'Shipped',
    total: 57.97, // (15.99 * 2) + 18.00 + 7.99 shipping
    items: [
      { productId: 'prod1', name: 'Neem Oil Spray', price: 15.99, quantity: 2, image: 'https://picsum.photos/100/100?random=1' },
      { productId: 'prod3', name: 'Copper Fungicide', price: 18.00, quantity: 1, image: 'https://picsum.photos/100/100?random=5' },
    ],
     shippingAddress: '123 Cotton Row, Farmville, TX 75001',
  },
  {
    id: 'ORD67890',
    orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    status: 'Delivered',
    total: 22.50, // 22.50 + 0 shipping
    items: [
      { productId: 'prod2', name: 'Bacillus Thuringiensis (Bt)', price: 22.50, quantity: 1, image: 'https://picsum.photos/100/100?random=3' },
    ],
     shippingAddress: '456 Planters Ln, Cottontown, GA 30303',
  },
   {
    id: 'ORD11223',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Processing',
    total: 12.99 + 7.99,
    items: [
       { productId: 'prod5', name: 'Insecticidal Soap', price: 12.99, quantity: 1, image: 'https://picsum.photos/100/100?random=9' },
    ],
     shippingAddress: '123 Cotton Row, Farmville, TX 75001',
  },
];

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


export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching orders
    const timer = setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setIsLoading(false);
    }, 700); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);


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
                           {order.items.map((item) => (
                             <TableRow key={item.productId}>
                               <TableCell>
                                 <Image
                                   src={item.image}
                                   alt={item.name}
                                   width={40}
                                   height={40}
                                   className="rounded object-cover aspect-square"
                                   data-ai-hint="product thumbnail order history"
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
                      <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                   </div>
                    <div className="flex justify-end gap-2 mt-4">
                       <Button variant="outline" size="sm">View Invoice</Button>
                       {order.status === 'Processing' && <Button variant="destructive" size="sm">Cancel Order</Button>}
                       {/* Add reorder button if needed */}
                       {/* <Button variant="secondary" size="sm">Reorder</Button> */}
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
