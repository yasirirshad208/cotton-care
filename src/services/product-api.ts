// src/services/product-api.ts

// THIS IS A MOCK API - NOW USES LOCAL STORAGE

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

const LOCAL_STORAGE_PRODUCTS_KEY = 'cottonCareProducts';

// Initial seed data if local storage is empty
const MOCK_PRODUCTS_SEED_DATA: Product[] = [
   { id: 'prod1', name: 'Neem Oil Spray', description: 'Organic broad-spectrum insecticide and fungicide. Controls aphids, whiteflies, spider mites, and powdery mildew. Apply every 7-14 days as needed.', price: 15.99, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], suitableFor: ['Aphids', 'Powdery mildew'], category: 'Organic', stock: 50 },
   { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', description: 'Biological insecticide effective against caterpillars like armyworms. Harmless to beneficial insects. Mix with water and spray thoroughly.', price: 22.50, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], suitableFor: ['Army worm'], category: 'Biological', stock: 30 },
   { id: 'prod3', name: 'Copper Fungicide', description: 'Effective against bacterial and fungal diseases like blight and target spot. Provides protective barrier on plant surfaces.', price: 18.00, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], suitableFor: ['Bacterial blight', 'Target spot', 'Cotton Boll Rot'], category: 'Chemical', stock: 100 },
   { id: 'prod4', name: 'Systemic Fungicide X', description: 'Provides systemic protection against various fungal issues including powdery mildew and target spot. Absorbed by the plant.', price: 25.00, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], suitableFor: ['Powdery mildew', 'Target spot'], category: 'Chemical', stock: 0 },
   { id: 'prod5', name: 'Insecticidal Soap', description: 'Effective against soft-bodied insects like aphids. Works on contact. Must spray directly on pests.', price: 12.99, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], suitableFor: ['Aphids'], category: 'Organic', stock: 75 },
   { id: 'prod6', name: 'General Purpose Fertilizer', description: 'Balanced nutrients (e.g., 10-10-10) for overall plant health and vigor. Promotes strong growth.', price: 19.99, images: ['https://placehold.co/600x600.png'], suitableFor: [], category: 'Fertilizer', stock: 150 },
 ];


// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getProductsFromLocalStorage(): Product[] {
  if (typeof window === 'undefined') return [...MOCK_PRODUCTS_SEED_DATA]; // Fallback for SSR or non-browser
  try {
    const storedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (storedProducts) {
      return JSON.parse(storedProducts);
    } else {
      // Initialize local storage with seed data if it's empty
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS_SEED_DATA));
      return [...MOCK_PRODUCTS_SEED_DATA];
    }
  } catch (error) {
    console.error("Error accessing localStorage for products:", error);
    return [...MOCK_PRODUCTS_SEED_DATA]; // Fallback to seed data on error
  }
}

function saveProductsToLocalStorage(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products to localStorage:", error);
  }
}


export async function getProducts(diseaseFilter?: string): Promise<Product[]> {
  await delay(100); // Shorter delay as it's local
  let products = getProductsFromLocalStorage();

  if (diseaseFilter) {
    const filtered = products.filter(p => p.suitableFor.includes(diseaseFilter));
    // If filter yields no results for the current local storage, return all local storage products as a fallback
    // This behavior might need adjustment based on desired UX (e.g., show "no products match filter" instead)
    return filtered.length > 0 ? filtered : products;
  }
  return products;
}

export async function getProductById(productId: string): Promise<Product | null> {
  await delay(50);
  const products = getProductsFromLocalStorage();
  const product = products.find(p => p.id === productId);
  return product || null;
}

export async function addProduct(newProductData: Omit<Product, 'id'>): Promise<Product> {
  await delay(200);
  let products = getProductsFromLocalStorage();
  const newProduct: Product = {
    ...newProductData,
    id: `prod${Math.random().toString(36).substring(2, 8)}`, // Generate mock ID
  };
  products.push(newProduct);
  saveProductsToLocalStorage(products);
  console.log("Local Storage: Added product", newProduct);
  return newProduct;
}

export async function updateProduct(productId: string, updatedProductData: Partial<Product>): Promise<Product | null> {
  await delay(200);
  let products = getProductsFromLocalStorage();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return null;
  }
  const updatedProduct = { ...products[productIndex], ...updatedProductData };
  products[productIndex] = updatedProduct;
  saveProductsToLocalStorage(products);
  console.log("Local Storage: Updated product", updatedProduct);
  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  await delay(200);
  let products = getProductsFromLocalStorage();
  const initialLength = products.length;
  const filteredProducts = products.filter(p => p.id !== productId);
  
  if (products.length === filteredProducts.length) {
     console.log(`Local Storage: Product ${productId} not found for deletion.`);
     return false; // Product not found
  }

  saveProductsToLocalStorage(filteredProducts);
  console.log(`Local Storage: Deleting product ${productId}. Success: true`);
  return true;
}
