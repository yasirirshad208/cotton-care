
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm, ProductFormData } from '@/components/admin/product-form';
import { addProduct } from '@/services/product-api';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // The ProductFormData 'images' and 'suitableFor' are already arrays of strings here
      // due to the transform in the zod schema.
      // The addProduct API expects Omit<Product, 'id'>.
      // Ensure the structure matches.
      const newProductData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        images: data.images, // This is string[]
        suitableFor: data.suitableFor || [], // This is string[] or string[]
      };
      await addProduct(newProductData);
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
    // setIsLoading(false); // Already handled by navigation or error state
  };

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Add New Product</h1>
            <Button variant="outline" asChild>
                <Link href="/admin/products">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} submitButtonText="Add Product" />
    </div>
  );
}
