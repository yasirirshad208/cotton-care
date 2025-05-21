
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
import { useCartContext } from '@/contexts/cart-context';
import type { ProductDetailsForCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import type { Product as ApiProduct } from '@/services/product-api'; // Import Product type
import { getProducts as fetchProductsApi } from '@/services/product-api'; // Import API function

// Using ApiProduct directly as it now reflects data from localStorage or initial seed
interface Product extends ApiProduct {}


function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartContext();

   const handleAddToCart = () => {
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


  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative">
         <Link href={`/products/${product.id}`}>
             <Image
                 src={product.images[0] || 'https://placehold.co/300x200.png'}
                 alt={product.name}
                 width={300}
                 height={200} 
                 className="w-full h-48 object-cover"
                 data-ai-hint={`${product.category} pesticide product`}
                 unoptimized={product.images[0]?.startsWith('https://placehold.co')}
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
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsBackup, setAllProductsBackup] = useState<Product[]>([]); // For fallback

  useEffect(() => {
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const allFetchedProducts = await fetchProductsApi(); // Fetches from local storage or seed
            setAllProductsBackup(allFetchedProducts); // Store all products for fallback

            if (disease) {
                const filteredProducts = await fetchProductsApi(disease); // API handles filtering logic now
                // If the API returns an empty array for the disease filter,
                // we decide here whether to show nothing or all products.
                // Current API logic returns all products if filter yields none.
                setProducts(filteredProducts);
            } else {
                setProducts(allFetchedProducts);
            }
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]); // Set to empty on error
        } finally {
            setIsLoading(false);
        }
    };
    loadProducts();
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
                 Showing products {products.length > 0 && products.length < allProductsBackup.length ? 'recommended for' : 'for'}: <Badge variant="secondary">{disease}</Badge>
                 {products.length === 0 && !isLoading && <span className="ml-2">No specific recommendations found, showing all products.</span>}
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
              No products available at the moment.
           </p>
        </div>
      )}
    </div>
  );
}


export default function ProductsPage() {
  return (
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

