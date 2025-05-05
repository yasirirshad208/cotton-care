'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, CheckCircle, XCircle, FlaskConical, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

// Mock product data - Replace with actual API call/data fetching
const ALL_PRODUCTS = [
  { id: 'prod1', name: 'Neem Oil Spray', description: 'Organic broad-spectrum insecticide and fungicide. Controls aphids, whiteflies, spider mites, and powdery mildew. Apply every 7-14 days as needed.', price: 15.99, images: ['https://picsum.photos/600/600?random=1', 'https://picsum.photos/600/600?random=2', 'https://picsum.photos/600/600?random=1a'], suitableFor: ['Aphids', 'Powdery mildew'], category: 'Organic', stock: 50 },
  { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', description: 'Biological insecticide effective against caterpillars like armyworms. Harmless to beneficial insects. Mix with water and spray thoroughly.', price: 22.50, images: ['https://picsum.photos/600/600?random=3', 'https://picsum.photos/600/600?random=4'], suitableFor: ['Army worm'], category: 'Biological', stock: 30 },
  { id: 'prod3', name: 'Copper Fungicide', description: 'Effective against bacterial and fungal diseases like blight and target spot. Provides protective barrier on plant surfaces.', price: 18.00, images: ['https://picsum.photos/600/600?random=5', 'https://picsum.photos/600/600?random=6', 'https://picsum.photos/600/600?random=5a', 'https://picsum.photos/600/600?random=5b'], suitableFor: ['Bacterial blight', 'Target spot', 'Cotton Boll Rot'], category: 'Chemical', stock: 100 },
  { id: 'prod4', name: 'Systemic Fungicide X', description: 'Provides systemic protection against various fungal issues including powdery mildew and target spot. Absorbed by the plant.', price: 25.00, images: ['https://picsum.photos/600/600?random=7', 'https://picsum.photos/600/600?random=8'], suitableFor: ['Powdery mildew', 'Target spot'], category: 'Chemical', stock: 0 },
  { id: 'prod5', name: 'Insecticidal Soap', description: 'Effective against soft-bodied insects like aphids. Works on contact. Must spray directly on pests.', price: 12.99, images: ['https://picsum.photos/600/600?random=9', 'https://picsum.photos/600/600?random=10'], suitableFor: ['Aphids'], category: 'Organic', stock: 75 },
  { id: 'prod6', name: 'General Purpose Fertilizer', description: 'Balanced nutrients (e.g., 10-10-10) for overall plant health and vigor. Promotes strong growth.', price: 19.99, images: ['https://picsum.photos/600/600?random=11'], suitableFor: [], category: 'Fertilizer', stock: 150 },
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  suitableFor: string[];
  category: string;
  stock: number;
}

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
    return <Skeleton className="w-full h-64 md:h-96 rounded-lg bg-muted" />; // Placeholder if no images
  }

  return (
    <div className="relative w-full h-64 md:h-96 group">
       {/* Main Image */}
       <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
           <Image
             src={images[currentIndex]}
             alt={`${productName} image ${currentIndex + 1}`}
             layout="fill"
             objectFit="contain" // Use contain to see the whole product
             className="transition-opacity duration-500 ease-in-out"
             key={currentIndex} // Add key for transition effect if needed
             data-ai-hint="pesticide product detail"
           />
        </div>

      {/* Navigation Arrows */}
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

       {/* Thumbnails/Dots */}
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
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined initially, null if not found
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching product data
    const foundProduct = ALL_PRODUCTS.find(p => p.id === productId);
    const timer = setTimeout(() => {
       setProduct(foundProduct || null); // Set to null if not found after "loading"
    }, 300); // Short delay to simulate loading
    return () => clearTimeout(timer);
  }, [productId]);

  const handleAddToCart = () => {
     if (!product) return;
     // Add actual cart logic here
     console.log(`Adding ${product.name} to cart`);
     toast({
        title: `${product.name} added to cart`,
        description: `Price: $${product.price.toFixed(2)}`,
        action: (
           <Button variant="outline" size="sm" asChild>
              <Link href="/cart">View Cart</Link>
           </Button>
         ),
     });
   };


  if (product === undefined) {
    // Loading state
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

  if (product === null) {
    // Not found state
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

  // Product found state
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/products">
             <ChevronLeft className="mr-1 h-4 w-4" /> Back to Products
          </Link>
       </Button>
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Image Slider Column */}
          <div className="p-4 md:p-6 bg-muted/30 flex items-center justify-center">
             <ProductImageSlider images={product.images} productName={product.name} />
          </div>

          {/* Details Column */}
          <div className="p-4 md:p-6 flex flex-col">
             <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
             <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
             <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>

             <Separator className="my-4" />

             <div className="mb-4">
                 <h3 className="text-lg font-semibold mb-1 flex items-center gap-1.5"> <Leaf className="h-5 w-5 text-primary"/> Description</h3>
                 <p className="text-muted-foreground text-sm">{product.description}</p>
             </div>


              {product.suitableFor.length > 0 && (
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
