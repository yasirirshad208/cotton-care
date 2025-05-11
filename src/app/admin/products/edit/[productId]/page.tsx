
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductForm, ProductFormData } from '@/components/admin/product-form';
import { getProductById, updateProduct, Product } from '@/services/product-api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setIsFetching(true);
        try {
          const fetchedProduct = await getProductById(productId);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
          } else {
            toast({ title: 'Error', description: 'Product not found.', variant: 'destructive' });
            router.push('/admin/products');
          }
        } catch (error) {
          console.error('Failed to fetch product:', error);
          toast({ title: 'Error', description: 'Failed to load product details.', variant: 'destructive' });
        } finally {
          setIsFetching(false);
        }
      };
      fetchProduct();
    }
  }, [productId, router, toast]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!product) return;
    setIsLoading(true);
    try {
      // ProductFormData images and suitableFor are already string[]
      const updatedProductData: Partial<Product> = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        images: data.images,
        suitableFor: data.suitableFor,
      };
      await updateProduct(product.id, updatedProductData);
      toast({
        title: 'Product Updated',
        description: `${data.name} has been successfully updated.`,
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    // This case should ideally be handled by redirection in useEffect
    return <div className="container mx-auto py-8 text-center">Product not found or failed to load.</div>;
  }

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Edit Product: {product.name}</h1>
            <Button variant="outline" asChild>
                <Link href="/admin/products">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
      <ProductForm
        onSubmit={handleSubmit}
        initialData={product}
        isLoading={isLoading}
        submitButtonText="Save Changes"
      />
    </div>
  );
}
