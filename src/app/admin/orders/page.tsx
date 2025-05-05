'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Mock order data - Replace with actual API call/data fetching
interface AdminOrderItem {
  productId: string;
  name: string;
  quantity: number;
}

interface AdminOrder {
  id: string;
  orderDate: string; // ISO string format
  customerName: string; // Added for admin view
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: AdminOrderItem[]; // Simplified for admin list view
}

const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  { id: 'ORD12345', orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), customerName: 'Alice Smith', status: 'Shipped', total: 57.97, items: [{ productId: 'prod1', name: 'Neem Oil Spray', quantity: 2 }, { productId: 'prod3', name: 'Copper Fungicide', quantity: 1 }] },
  { id: 'ORD67890', orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), customerName: 'Bob Johnson', status: 'Delivered', total: 22.50, items: [{ productId: 'prod2', name: 'Bacillus Thuringiensis (Bt)', quantity: 1 }] },
  { id: 'ORD11223', orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), customerName: 'Alice Smith', status: 'Processing', total: 20.98, items: [{ productId: 'prod5', name: 'Insecticidal Soap', quantity: 1 }] },
   { id: 'ORD44556', orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), customerName: 'Charlie Brown', status: 'Cancelled', total: 18.00, items: [{ productId: 'prod3', name: 'Copper Fungicide', quantity: 1 }] },
];

const getStatusBadgeVariant = (status: AdminOrder['status']): "default" | "secondary" | "outline" | "destructive" => {
   switch (status) {
    case 'Delivered': return 'default';
    case 'Shipped': return 'secondary';
    case 'Processing': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
   const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching orders
    const timer = setTimeout(() => {
      setOrders(MOCK_ADMIN_ORDERS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: AdminOrder['status']) => {
      setUpdatingStatusOrderId(orderId);
     // Simulate API call
     console.log(`Updating order ${orderId} to status ${newStatus}`);
     setTimeout(() => {
         setOrders(prevOrders =>
           prevOrders.map(order =>
             order.id === orderId ? { ...order, status: newStatus } : order
           )
         );
          toast({
            title: "Order Status Updated",
            description: `Order ${orderId} status set to ${newStatus}.`,
         });
          setUpdatingStatusOrderId(null);
     }, 800);
  };

   if (isLoading) {
      return (
          <div>
              <Skeleton className="h-8 w-1/4 mb-6" />
              <Card>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {[...Array(5)].map((_, i) => (
                                  <TableRow key={i}>
                                       {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
      )
  }


  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Order Management</h1>

      <Card>
         <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>View and manage customer orders.</CardDescription>
         </CardHeader>
        <CardContent className="p-0">
           {orders.length === 0 ? (
              <div className="text-center p-10 text-muted-foreground">
                 No orders found.
              </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Order ID</TableHead>
                   <TableHead>Date</TableHead>
                   <TableHead>Customer</TableHead>
                   <TableHead className="text-center">Status</TableHead>
                   <TableHead className="text-right">Total</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {orders.map((order) => (
                   <TableRow key={order.id}>
                     <TableCell className="font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                            {order.id}
                        </Link>
                     </TableCell>
                     <TableCell>{format(new Date(order.orderDate), 'PP')}</TableCell>
                     <TableCell>{order.customerName}</TableCell>
                     <TableCell className="text-center">
                        {updatingStatusOrderId === order.id ? (
                            <Skeleton className="h-6 w-24 mx-auto"/>
                        ) : (
                           <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                        )}
                     </TableCell>
                     <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                     <TableCell className="text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={updatingStatusOrderId === order.id}>
                             <MoreHorizontal className="h-4 w-4" />
                             <span className="sr-only">Actions</span>
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                 <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                           </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')}>
                             <XCircle className="mr-2 h-4 w-4" /> Mark as Processing
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Shipped')}>
                             <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Delivered')}>
                             <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                           </DropdownMenuItem>
                           <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                           >
                             <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
