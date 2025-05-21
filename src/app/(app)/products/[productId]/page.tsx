
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, XCircle, FlaskConical, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/contexts/cart-context';
import type { ProductDetailsForCart } from '@/hooks/use-cart';
import { getProductById as fetchProductByIdApi } from '@/services/product-api'; // Import API function
import type { Product as ApiProduct } from '@/services/product-api'; // Import Product type

// Use ApiProduct directly, assuming it includes all necessary fields for display and cart addition
interface Product extends ApiProduct {}


function ProductImageSlider({ images, productName }: { images: string[], productName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

   const goToSlide = (slideIndex: number) => {
       setCurrentIndex(slideIndex);
   };


  if (!images || images.length === 0) {
    return <Skeleton className="w-full h-64 md:h-96 rounded-lg bg-muted" />;
  }

  return (
    <div className="relative w-full h-64 md:h-96 group">
       <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
           <Image
             src={images[currentIndex]}
             alt={`${productName} image ${currentIndex + 1}`}
             fill 
             style={{objectFit:"contain"}} 
             className="transition-opacity duration-500 ease-in-out"
             key={currentIndex}
             data-ai-hint="pesticide product detail"
             unoptimized={images[currentIndex].startsWith('https://placehold.co')}
           />
        </div>
       {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
       )}
       {images.length > 1 && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
               {images.map((_, slideIndex) => (
                   <button
                       key={slideIndex}
                       onClick={() => goToSlide(slideIndex)}
                       className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                           currentIndex === slideIndex ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/50'
                       }`}
                       aria-label={`Go to slide ${slideIndex + 1}`}
                   />
               ))}
           </div>
       )}
    </div>
  );
}


export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for initial loading state
  const { addItem } = useCartContext();

  useEffect(() => {
    const fetchProduct = async () => {
        if (productId) {
            try {
                const fetchedProduct = await fetchProductByIdApi(productId);
                setProduct(fetchedProduct); // Will be null if not found
            } catch (error) {
                console.error("Failed to fetch product:", error);
                setProduct(null); // Set to null on error
            }
        }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
     if (!product) return;
     const productDetails: ProductDetailsForCart = {
       id: product.id,
       name: product.name,
       price: product.price,
       image: product.images[0] || 'https://placehold.co/100x100.png',
       stock: product.stock,
       description: product.description, 
       category: product.category,
       suitableFor: product.suitableFor,
       images: product.images
     };
     addItem(productDetails, 1);
   };


  if (product === undefined) { // Still loading
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="w-full h-64 md:h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
             <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) { // Loaded, but not found or error occurred
    return (
      <div className="container mx-auto py-16 px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/products">
             <ChevronLeft className="mr-1 h-4 w-4" /> Back to Products
          </Link>
       </Button>
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div className="p-4 md:p-6 bg-muted/30 flex items-center justify-center">
             <ProductImageSlider images={product.images} productName={product.name} />
          </div>
          <div className="p-4 md:p-6 flex flex-col">
             <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
             <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
             <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
             <Separator className="my-4" />
             <div className="mb-4">
                 <h3 className="text-lg font-semibold mb-1 flex items-center gap-1.5"> <Leaf className="h-5 w-5 text-primary"/> Description</h3>
                 <p className="text-muted-foreground text-sm">{product.description}</p>
             </div>
              {product.suitableFor && product.suitableFor.length > 0 && (
                 <div className="mb-4">
                     <h3 className="text-lg font-semibold mb-1 flex items-center gap-1.5"><FlaskConical className="h-5 w-5 text-accent"/> Suitable For</h3>
                     <div className="flex flex-wrap gap-2">
                         {product.suitableFor.map((disease) => (
                             <Badge key={disease} variant="outline">{disease}</Badge>
                         ))}
                     </div>
                 </div>
              )}
              <div className="mb-6 mt-auto pt-4">
                 <div className="flex items-center gap-2 mb-4">
                   {product.stock > 0 ? (
                     <>
                       <CheckCircle className="h-5 w-5 text-green-600" />
                       <span className="text-sm font-medium text-green-700">In Stock ({product.stock} available)</span>
                     </>
                   ) : (
                     <>
                       <XCircle className="h-5 w-5 text-destructive" />
                       <span className="text-sm font-medium text-destructive">Out of Stock</span>
                     </>
                   )}
                 </div>
                 <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                 </Button>
              </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

