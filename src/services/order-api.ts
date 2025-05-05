// src/services/order-api.ts

// THIS IS A MOCK API - REPLACE WITH ACTUAL BACKEND INTEGRATION

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
   fullName: string;
   addressLine1: string;
   addressLine2?: string;
   city: string;
   state: string;
   zipCode: string;
   phoneNumber: string;
}

export interface Order {
  id: string;
  orderDate: string; // ISO string format
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  // Potentially add customerId, payment info summary etc.
  customerId?: string; // Assuming association with a user
}

// Mock data storage (replace with actual DB interaction)
const MOCK_ORDERS: Order[] = [
   {
    id: 'ORD12345',
    customerId: 'user1',
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Shipped',
    total: 57.97,
    items: [
      { productId: 'prod1', name: 'Neem Oil Spray', price: 15.99, quantity: 2, image: 'https://picsum.photos/100/100?random=1' },
      { productId: 'prod3', name: 'Copper Fungicide', price: 18.00, quantity: 1, image: 'https://picsum.photos/100/100?random=5' },
    ],
     shippingAddress: { fullName: 'Alice Smith', addressLine1: '123 Cotton Row', city: 'Farmville', state: 'TX', zipCode: '75001', phoneNumber: '555-1111' },
  },
  {
    id: 'ORD67890',
     customerId: 'user2',
    orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 22.50,
    items: [
      { productId: 'prod2', name: 'Bacillus Thuringiensis (Bt)', price: 22.50, quantity: 1, image: 'https://picsum.photos/100/100?random=3' },
    ],
     shippingAddress: { fullName: 'Bob Johnson', addressLine1: '456 Planters Ln', city: 'Cottontown', state: 'GA', zipCode: '30303', phoneNumber: '555-2222' },
  },
   {
    id: 'ORD11223',
     customerId: 'user1',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Processing',
    total: 20.98, // 12.99 + 7.99 shipping
    items: [
       { productId: 'prod5', name: 'Insecticidal Soap', price: 12.99, quantity: 1, image: 'https://picsum.photos/100/100?random=9' },
    ],
     shippingAddress: { fullName: 'Alice Smith', addressLine1: '123 Cotton Row', city: 'Farmville', state: 'TX', zipCode: '75001', phoneNumber: '555-1111' },
  },
    { id: 'ORD44556', customerId: 'user3', orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'Cancelled', total: 18.00, items: [{ productId: 'prod3', name: 'Copper Fungicide', quantity: 1, price: 18.00, image: 'https://picsum.photos/100/100?random=5' }], shippingAddress: { fullName: 'Charlie Brown', addressLine1: '789 Harvest Ave', city: 'Fieldstone', state: 'AL', zipCode: '35005', phoneNumber: '555-3333' } },

];


// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User Functions ---

/**
 * Gets orders for the currently logged-in user (mock implementation).
 * In a real app, this would require user authentication context.
 */
export async function getUserOrders(userId: string = 'user1'): Promise<Order[]> {
  await delay(400);
  // Filter mock orders by a hardcoded user ID for now
  return MOCK_ORDERS.filter(order => order.customerId === userId);
}

/**
 * Creates a new order (mock implementation).
 */
export interface PlaceOrderInput {
  items: Omit<OrderItem, 'name' | 'image'>[]; // Only need productId, price, quantity
  shippingAddress: ShippingAddress;
  total: number; // Assume total is calculated client-side or verified server-side
   customerId: string; // Associate order with a user
}

export async function placeOrder(orderInput: PlaceOrderInput): Promise<Order> {
  await delay(1000); // Simulate processing time

   // In real API: Validate items, check stock, process payment, etc.

   // Fetch full item details (mock)
   const orderItemsWithDetails: OrderItem[] = orderInput.items.map(item => {
      // In real API, fetch product details from DB based on item.productId
       const productDetails = MOCK_ORDERS.flatMap(o => o.items).find(p => p.productId === item.productId) || { name: 'Unknown Product', image: 'https://picsum.photos/100/100?random=0'};
      return {
         ...item,
         name: productDetails.name,
         image: productDetails.image
      };
   });


  const newOrder: Order = {
    id: `ORD${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    orderDate: new Date().toISOString(),
    status: 'Processing',
    total: orderInput.total,
    items: orderItemsWithDetails,
    shippingAddress: orderInput.shippingAddress,
    customerId: orderInput.customerId,
  };

  MOCK_ORDERS.unshift(newOrder); // Add to the beginning of the mock list
  console.log("Mock API: Placed order", newOrder);
  return newOrder;
}


// --- Admin Functions ---

/**
 * Gets all orders (for admin).
 */
export async function getAllOrders(): Promise<Order[]> {
  await delay(500);
  return MOCK_ORDERS;
}

/**
 * Gets a single order by ID (for admin).
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
   await delay(200);
   const order = MOCK_ORDERS.find(o => o.id === orderId);
   return order || null;
}


/**
 * Updates the status of an order (for admin).
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order | null> {
  await delay(300);
  const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    return null;
  }
  MOCK_ORDERS[orderIndex].status = newStatus;
   console.log(`Mock API: Updated order ${orderId} status to ${newStatus}`);
  return MOCK_ORDERS[orderIndex];
}
