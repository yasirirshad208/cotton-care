
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOrderById, updateOrderStatus, Order, OrderItem as ApiOrderItem } from '@/services/order-api'; // Ensure OrderItem is imported if distinct
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ChevronLeft, Package, UserCircle, MapPin, DollarSign, CalendarDays, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// If OrderItem from API is different from AdminOrderItem locally
type DisplayOrderItem = ApiOrderItem; // Use the one from order-api

const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'Delivered': return 'default';
    case 'Shipped': return 'secondary';
    case 'Processing': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

const statusOptions: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          const fetchedOrder = await getOrderById(orderId);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
          } else {
            toast({ title: 'Error', description: 'Order not found.', variant: 'destructive' });
            router.push('/admin/orders');
          }
        } catch (error) {
          console.error('Failed to fetch order:', error);
          toast({ title: 'Error', description: 'Failed to load order details.', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, router, toast]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      if (updatedOrder) {
        setOrder(updatedOrder);
        toast({ title: 'Status Updated', description: `Order status changed to ${newStatus}.` });
      } else {
        toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'An error occurred while updating status.', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="container mx-auto py-8 text-center">Order not found or failed to load.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Order Details: #{order.id}</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items and Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: DisplayOrderItem) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Image
                          src={item.image || 'https://picsum.photos/100/100?random=0'} // Fallback image
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover aspect-square"
                          data-ai-hint="product thumbnail small"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${item.productId}`} className="hover:text-primary" target="_blank">
                            {item.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end bg-muted/50 p-4">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal: ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</p>
                    {/* Assuming shipping is part of total or calculated differently */}
                    <p className="text-lg font-semibold">Order Total: ${order.total.toFixed(2)}</p>
                </div>
            </CardFooter>
          </Card>
        </div>

        {/* Order Information & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary"/> Customer & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Customer Name</Label>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Order Date</Label>
                <p className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted-foreground"/>{format(new Date(order.orderDate), 'PPP p')}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Current Status</Label>
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm mt-1">
                    {order.status === 'Processing' && <Loader2 className="mr-1 h-3 w-3 animate-spin"/>}
                    {order.status === 'Shipped' && <Truck className="mr-1 h-3 w-3"/>}
                    {order.status === 'Delivered' && <CheckCircle className="mr-1 h-3 w-3"/>}
                    {order.status === 'Cancelled' && <XCircle className="mr-1 h-3 w-3"/>}
                    {order.status}
                </Badge>
              </div>
               <div className="space-y-1 pt-2">
                <Label htmlFor="status-update">Update Status</Label>
                <Select
                  value={order.status}
                  onValueChange={(value: Order['status']) => handleStatusChange(value)}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger id="status-update" className="w-full" disabled={isUpdatingStatus}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>Phone: {order.shippingAddress.phoneNumber}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
