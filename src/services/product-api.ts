// src/services/product-api.ts

// THIS IS A MOCK API - REPLACE WITH ACTUAL BACKEND INTEGRATION

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // URLs
  suitableFor: string[]; // Array of disease names
  category: string;
  stock: number;
}

const ALL_PRODUCTS: Product[] = [
   { id: 'prod1', name: 'Neem Oil Spray', description: 'Organic broad-spectrum insecticide and fungicide. Controls aphids, whiteflies, spider mites, and powdery mildew. Apply every 7-14 days as needed.', price: 15.99, images: ['https://picsum.photos/600/600?random=1', 'https://picsum.photos/600/600?random=2', 'https://picsum.photos/600/600?random=1a'], suitableFor: ['Aphids', 'Powdery mildew'], category: 'Organic', stock: 50 },
   { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', description: 'Biological insecticide effective against caterpillars like armyworms. Harmless to beneficial insects. Mix with water and spray thoroughly.', price: 22.50, images: ['https://picsum.photos/600/600?random=3', 'https://picsum.photos/600/600?random=4'], suitableFor: ['Army worm'], category: 'Biological', stock: 30 },
   { id: 'prod3', name: 'Copper Fungicide', description: 'Effective against bacterial and fungal diseases like blight and target spot. Provides protective barrier on plant surfaces.', price: 18.00, images: ['https://picsum.photos/600/600?random=5', 'https://picsum.photos/600/600?random=6', 'https://picsum.photos/600/600?random=5a', 'https://picsum.photos/600/600?random=5b'], suitableFor: ['Bacterial blight', 'Target spot', 'Cotton Boll Rot'], category: 'Chemical', stock: 100 },
   { id: 'prod4', name: 'Systemic Fungicide X', description: 'Provides systemic protection against various fungal issues including powdery mildew and target spot. Absorbed by the plant.', price: 25.00, images: ['https://picsum.photos/600/600?random=7', 'https://picsum.photos/600/600?random=8'], suitableFor: ['Powdery mildew', 'Target spot'], category: 'Chemical', stock: 0 },
   { id: 'prod5', name: 'Insecticidal Soap', description: 'Effective against soft-bodied insects like aphids. Works on contact. Must spray directly on pests.', price: 12.99, images: ['https://picsum.photos/600/600?random=9', 'https://picsum.photos/600/600?random=10'], suitableFor: ['Aphids'], category: 'Organic', stock: 75 },
   { id: 'prod6', name: 'General Purpose Fertilizer', description: 'Balanced nutrients (e.g., 10-10-10) for overall plant health and vigor. Promotes strong growth.', price: 19.99, images: ['https://picsum.photos/600/600?random=11'], suitableFor: [], category: 'Fertilizer', stock: 150 },
 ];


// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(diseaseFilter?: string): Promise<Product[]> {
  await delay(300); // Simulate network latency
  if (diseaseFilter) {
    const filtered = ALL_PRODUCTS.filter(p => p.suitableFor.includes(diseaseFilter));
    // If filter yields no results, return all products as a fallback
    return filtered.length > 0 ? filtered : ALL_PRODUCTS;
  }
  return ALL_PRODUCTS;
}

export async function getProductById(productId: string): Promise<Product | null> {
  await delay(200);
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  return product || null;
}

// Mock admin functions - These would interact with your Express/MongoDB backend
export async function addProduct(newProductData: Omit<Product, 'id'>): Promise<Product> {
  await delay(500);
  const newProduct: Product = {
    ...newProductData,
    id: `prod${Math.random().toString(36).substring(2, 8)}`, // Generate mock ID
  };
  ALL_PRODUCTS.push(newProduct); // In-memory update (replace with API call)
  console.log("Mock API: Added product", newProduct);
  return newProduct;
}

export async function updateProduct(productId: string, updatedProductData: Partial<Product>): Promise<Product | null> {
  await delay(500);
  const productIndex = ALL_PRODUCTS.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return null;
  }
  const updatedProduct = { ...ALL_PRODUCTS[productIndex], ...updatedProductData };
  ALL_PRODUCTS[productIndex] = updatedProduct; // In-memory update
  console.log("Mock API: Updated product", updatedProduct);
  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  await delay(500);
  const initialLength = ALL_PRODUCTS.length;
  const filteredProducts = ALL_PRODUCTS.filter(p => p.id !== productId);
   // Update the "global" mock array - very basic simulation
   ALL_PRODUCTS.length = 0;
   ALL_PRODUCTS.push(...filteredProducts);

  const success = ALL_PRODUCTS.length < initialLength;
  console.log(`Mock API: Deleting product ${productId}. Success: ${success}`);
  return success;
}
