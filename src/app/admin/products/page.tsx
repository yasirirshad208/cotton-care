
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
} from "@/components/ui/alert-dialog";
import { getProducts, deleteProduct as deleteProductApi, Product as ApiProduct } from '@/services/product-api';


interface Product extends ApiProduct {
  // local image representation if different from ApiProduct
  // for this case, ApiProduct already has images: string[]
  // we'll use images[0] for the list display
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of product being deleted
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await getProducts(); // Using the API function
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({ title: "Error", description: "Could not load products.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const handleDeleteProduct = async (productId: string, productName: string) => {
      setIsDeleting(productId);
      try {
           await deleteProductApi(productId); // Using the API function
           setProducts(prev => prev.filter(p => p.id !== productId));
           toast({
               title: "Product Deleted",
               description: `${productName} has been successfully deleted.`,
           });
      } catch (error) {
          console.error(`Failed to delete product ${productId}:`, error);
          toast({ title: "Error", description: `Could not delete ${productName}.`, variant: "destructive"});
      } finally {
        setIsDeleting(null);
      }
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
                 {isLoading && products.length > 0 && isDeleting === null ? ( // Show skeleton only if main loading, not during delete
                     [...Array(3)].map((_, i) => (
                       <TableRow key={`loading-${i}`}>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-10 rounded" /></TableCell>
                          {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                       </TableRow>
                     ))
                  ) : (
                     products.map((product) => (
                       <TableRow key={product.id}>
                         <TableCell className="hidden sm:table-cell">
                           <Image
                             src={product.images && product.images.length > 0 ? product.images[0] : 'https://picsum.photos/100/100?random=0'} // Fallback
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
                                 <Button variant="ghost" size="icon" disabled={isDeleting === product.id}>
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
                                     <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isDeleting === product.id}>
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
                                  <AlertDialogCancel disabled={isDeleting === product.id}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                     onClick={() => handleDeleteProduct(product.id, product.name)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                     disabled={isDeleting === product.id}
                                  >
                                    {isDeleting === product.id ? "Deleting..." : "Delete"}
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
