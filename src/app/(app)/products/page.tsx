'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, FlaskConical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock product data - Replace with actual API call/data fetching
const ALL_PRODUCTS = [
  { id: 'prod1', name: 'Neem Oil Spray', description: 'Organic broad-spectrum insecticide and fungicide.', price: 15.99, images: ['https://picsum.photos/300/300?random=1', 'https://picsum.photos/300/300?random=2'], suitableFor: ['Aphids', 'Powdery mildew'], category: 'Organic', stock: 50 },
  { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', description: 'Biological insecticide effective against caterpillars.', price: 22.50, images: ['https://picsum.photos/300/300?random=3', 'https://picsum.photos/300/300?random=4'], suitableFor: ['Army worm'], category: 'Biological', stock: 30 },
  { id: 'prod3', name: 'Copper Fungicide', description: 'Effective against bacterial and fungal diseases.', price: 18.00, images: ['https://picsum.photos/300/300?random=5', 'https://picsum.photos/300/300?random=6'], suitableFor: ['Bacterial blight', 'Target spot', 'Cotton Boll Rot'], category: 'Chemical', stock: 100 },
  { id: 'prod4', name: 'Systemic Fungicide X', description: 'Provides systemic protection against various fungal issues.', price: 25.00, images: ['https://picsum.photos/300/300?random=7', 'https://picsum.photos/300/300?random=8'], suitableFor: ['Powdery mildew', 'Target spot'], category: 'Chemical', stock: 0 }, // Out of stock example
  { id: 'prod5', name: 'Insecticidal Soap', description: 'Effective against soft-bodied insects like aphids.', price: 12.99, images: ['https://picsum.photos/300/300?random=9', 'https://picsum.photos/300/300?random=10'], suitableFor: ['Aphids'], category: 'Organic', stock: 75 },
   { id: 'prod6', name: 'General Purpose Fertilizer', description: 'Balanced nutrients for overall plant health.', price: 19.99, images: ['https://picsum.photos/300/300?random=11'], suitableFor: [], category: 'Fertilizer', stock: 150 }, // No specific disease
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

function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast(); // Assuming useToast is available globally or via context

   const handleAddToCart = () => {
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


  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative">
         <Link href={`/products/${product.id}`}>
             <Image
                 src={product.images[0]}
                 alt={product.name}
                 width={300}
                 height={200} // Adjust height as needed
                 className="w-full h-48 object-cover" // Ensure image covers the area
                 data-ai-hint={`${product.category} pesticide product`}
             />
         </Link>
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
        )}
         <Badge variant="secondary" className="absolute top-2 left-2">{product.category}</Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
         <Link href={`/products/${product.id}`}>
             <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">{product.name}</CardTitle>
         </Link>
        <CardDescription className="text-sm text-muted-foreground h-10 overflow-hidden mb-2">
          {product.description}
        </CardDescription>
        <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const disease = searchParams.get('disease');
  const [isLoading, setIsLoading] = useState(true); // Simulate loading
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      let filteredProducts;
      if (disease) {
        filteredProducts = ALL_PRODUCTS.filter(p => p.suitableFor.includes(disease));
         // If no specific products found for the disease, show all products as a fallback
         if (filteredProducts.length === 0) {
            filteredProducts = ALL_PRODUCTS;
            // Optionally add a message indicating fallback?
         }
      } else {
        filteredProducts = ALL_PRODUCTS;
      }
      setProducts(filteredProducts);
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [disease]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
           <FlaskConical className="h-7 w-7 text-primary" />
           Pesticide Products
        </h1>
         {disease && (
             <p className="text-muted-foreground mt-1">
                 Showing products recommended for: <Badge variant="secondary">{disease}</Badge>
             </p>
         )}
          {!disease && (
             <p className="text-muted-foreground mt-1">
                 Browse all available products.
             </p>
          )}
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
               <Card key={i} className="w-full">
                 <Skeleton className="h-48 w-full" />
                 <CardContent className="p-4 space-y-2">
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-1/2" />
                 </CardContent>
                 <CardFooter className="p-4 border-t">
                    <Skeleton className="h-10 w-full" />
                 </CardFooter>
               </Card>
            ))}
         </div>
       ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
           <p className="text-xl text-muted-foreground">
              {disease ? `No specific products found recommended for ${disease}. Showing all products.` : "No products available at the moment."}
           </p>
           {/* Optionally show all products if filter yields none */}
            {!isLoading && disease && ALL_PRODUCTS.length > 0 && products.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {ALL_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

// Need to import useToast and useEffect
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from 'react';


export default function ProductsPage() {
  return (
    // Suspense boundary is important for useSearchParams
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}


function ProductsLoadingSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
             <div className="mb-6">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                   <Card key={i} className="w-full">
                     <Skeleton className="h-48 w-full" />
                     <CardContent className="p-4 space-y-2">
                       <Skeleton className="h-6 w-3/4" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-1/2" />
                     </CardContent>
                     <CardFooter className="p-4 border-t">
                        <Skeleton className="h-10 w-full" />
                     </CardFooter>
                   </Card>
                ))}
             </div>
         </div>
    )
}
