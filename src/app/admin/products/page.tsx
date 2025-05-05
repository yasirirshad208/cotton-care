'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2, PackageSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


// Mock product data - Replace with actual API call/data fetching
const MOCK_PRODUCTS = [
  { id: 'prod1', name: 'Neem Oil Spray', category: 'Organic', price: 15.99, stock: 50, image: 'https://picsum.photos/100/100?random=1' },
  { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', category: 'Biological', price: 22.50, stock: 30, image: 'https://picsum.photos/100/100?random=3' },
  { id: 'prod3', name: 'Copper Fungicide', category: 'Chemical', price: 18.00, stock: 100, image: 'https://picsum.photos/100/100?random=5' },
  { id: 'prod4', name: 'Systemic Fungicide X', category: 'Chemical', price: 25.00, stock: 0, image: 'https://picsum.photos/100/100?random=7' },
  { id: 'prod5', name: 'Insecticidal Soap', category: 'Organic', price: 12.99, stock: 75, image: 'https://picsum.photos/100/100?random=9' },
  { id: 'prod6', name: 'General Purpose Fertilizer', category: 'Fertilizer', price: 19.99, stock: 150, image: 'https://picsum.photos/100/100?random=11' },
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string; // Assuming a single primary image for the admin list
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching products
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteProduct = (productId: string, productName: string) => {
      // Simulate API call to delete
      console.log(`Deleting product ${productId}`);
      setIsLoading(true); // You might want finer-grained loading state per row
      setTimeout(() => {
           setProducts(prev => prev.filter(p => p.id !== productId));
           toast({
               title: "Product Deleted",
               description: `${productName} has been successfully deleted.`,
           });
           setIsLoading(false);
      }, 800)

  };

  if (isLoading && products.length === 0) {
      return (
          <div>
              <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-32" />
              </div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Product Management</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>Manage your store's products here.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 && !isLoading ? (
             <div className="text-center p-10 text-muted-foreground">
                 <PackageSearch className="mx-auto h-12 w-12 mb-4"/>
                No products found. Add your first product!
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="hidden sm:table-cell w-[80px]">Image</TableHead>
                   <TableHead>Name</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead className="text-right">Price</TableHead>
                   <TableHead className="text-center">Stock</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading && products.length > 0 ? (
                     // Skeleton rows while loading updates
                     [...Array(3)].map((_, i) => (
                       <TableRow key={`loading-${i}`}>
                          {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                       </TableRow>
                     ))
                  ) : (
                     products.map((product) => (
                       <TableRow key={product.id}>
                         <TableCell className="hidden sm:table-cell">
                           <Image
                             src={product.image}
                             alt={product.name}
                             width={40}
                             height={40}
                             className="rounded object-cover aspect-square"
                             data-ai-hint="product thumbnail admin"
                           />
                         </TableCell>
                         <TableCell className="font-medium">{product.name}</TableCell>
                         <TableCell>
                           <Badge variant="outline">{product.category}</Badge>
                         </TableCell>
                         <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                         <TableCell className="text-center">
                           <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                             {product.stock > 0 ? product.stock : 'Out'}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                           <AlertDialog>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon">
                                   <MoreHorizontal className="h-4 w-4" />
                                   <span className="sr-only">Actions</span>
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem asChild>
                                   <Link href={`/admin/products/edit/${product.id}`}>
                                     <Edit className="mr-2 h-4 w-4" /> Edit
                                   </Link>
                                 </DropdownMenuItem>
                                 <AlertDialogTrigger asChild>
                                     <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                       <Trash2 className="mr-2 h-4 w-4" /> Delete
                                     </DropdownMenuItem>
                                  </AlertDialogTrigger>
                               </DropdownMenuContent>
                             </DropdownMenu>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product
                                    "{product.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                     onClick={() => handleDeleteProduct(product.id, product.name)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                     disabled={isLoading} // Disable during deletion
                                  >
                                    {isLoading ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                         </TableCell>
                       </TableRow>
                     ))
                  )}
               </TableBody>
             </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
