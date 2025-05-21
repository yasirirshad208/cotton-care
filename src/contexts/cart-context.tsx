// src/contexts/cart-context.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, CartItem, ProductDetailsForCart } from '@/hooks/use-cart';

interface CartContextType {
  cartItems: CartItem[];
  isCartLoading: boolean;
  addItem: (product: ProductDetailsForCart, quantity?: number) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart(); // This hook now returns isCartLoading
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
