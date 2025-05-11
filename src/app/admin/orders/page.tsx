
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getAllOrders, updateOrderStatus as updateOrderStatusApi, Order as ApiOrder } from '@/services/order-api';


// Simplified AdminOrder for list view
interface AdminOrder extends Pick<ApiOrder, 'id' | 'orderDate' | 'status' | 'total' > {
  customerName: string; // Assuming shippingAddress.fullName can be used
}


const getStatusBadgeVariant = (status: ApiOrder['status']): "default" | "secondary" | "outline" | "destructive" => {
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
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const apiOrders = await getAllOrders();
            const mappedOrders: AdminOrder[] = apiOrders.map(o => ({
                id: o.id,
                orderDate: o.orderDate,
                customerName: o.shippingAddress.fullName,
                status: o.status,
                total: o.total,
            }));
            setOrders(mappedOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({ title: "Error", description: "Could not load orders.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    fetchOrders();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, newStatus: ApiOrder['status']) => {
      setUpdatingStatusOrderId(orderId);
     try {
         await updateOrderStatusApi(orderId, newStatus);
         setOrders(prevOrders =>
           prevOrders.map(order =>
             order.id === orderId ? { ...order, status: newStatus } : order
           )
         );
          toast({
            title: "Order Status Updated",
            description: `Order ${orderId} status set to ${newStatus}.`,
         });
     } catch (error) {
        console.error(`Failed to update status for order ${orderId}:`, error);
        toast({ title: "Error", description: `Could not update status for order ${orderId}.`, variant: "destructive" });
     } finally {
        setUpdatingStatusOrderId(null);
     }
  };

   if (isLoading) {
      return (
          <div>
              <Skeleton className="h-8 w-1/4 mb-6" />
              <Card>
                  <CardHeader>
                        <Skeleton className="h-6 w-1/2 mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
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
            <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary"/>All Orders</CardTitle>
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
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-primary hover:underline">
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
                             <span className="sr-only">Actions for order {order.id}</span>
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                 <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                           </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')} disabled={order.status === 'Processing' || order.status === 'Cancelled' || order.status === 'Delivered'}>
                             <XCircle className="mr-2 h-4 w-4" /> Mark as Processing
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Shipped')} disabled={order.status === 'Shipped' || order.status === 'Cancelled' || order.status === 'Delivered'}>
                             <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Delivered')} disabled={order.status === 'Delivered' || order.status === 'Cancelled'}>
                             <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                           </DropdownMenuItem>
                           <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
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
