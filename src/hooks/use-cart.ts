// src/hooks/use-cart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number; // Max available stock for this product
}

// Define ProductDetailsForCart which is what's passed when adding a new item.
// It's essentially a CartItem without the quantity, as quantity is specified on add.
export interface ProductDetailsForCart extends Omit<CartItem, 'quantity'> {}

const LOCAL_STORAGE_CART_KEY = 'cottonCareCart';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // To handle initial load from localStorage
  const { toast } = useToast();

  // Load cart from localStorage on initial client-side mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      toast({
        title: "Error loading cart",
        description: "There was an issue loading your cart from storage.",
        variant: "destructive",
      });
      // Optionally clear corrupted cart data
      // localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    }
    setIsLoading(false);
  }, [toast]);

  // Save cart to localStorage whenever it changes, after initial load
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
        toast({
          title: "Error saving cart",
          description: "Could not save your cart changes to storage.",
          variant: "destructive",
        });
      }
    }
  }, [cartItems, isLoading, toast]);

  const addItem = useCallback((product: ProductDetailsForCart, quantityToAdd: number = 1) => {
    if (quantityToAdd <= 0) return;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `Cannot add more than ${product.stock} units of ${product.name}. You already have ${existingItem.quantity}.`,
            variant: "destructive",
          });
          return prevItems; // Do not update if stock limit exceeded
        }
        toast({
            title: `${product.name} quantity updated in cart.`,
        });
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        if (quantityToAdd > product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `Cannot add more than ${product.stock} units of ${product.name}.`,
            variant: "destructive",
          });
          return prevItems; // Do not add if stock limit exceeded
        }
        toast({
            title: `${product.name} added to cart.`,
        });
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      }
    });
  }, [toast]);

  const updateItemQuantity = useCallback((productId: string, newQuantity: number) => {
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === productId);
      if (!itemToUpdate) return prevItems;

      if (newQuantity <= 0) {
        // If quantity is zero or less, remove the item
        toast({
          title: `${itemToUpdate.name} removed from cart.`,
        });
        return prevItems.filter(item => item.id !== productId);
      }

      if (newQuantity > itemToUpdate.stock) {
        toast({
          title: "Stock Limit Reached",
          description: `Cannot set quantity for ${itemToUpdate.name} to ${newQuantity}. Max stock is ${itemToUpdate.stock}.`,
          variant: "destructive",
        });
        return prevItems.map(item => // Reset to max stock if user tries to exceed via input
          item.id === productId ? { ...item, quantity: item.stock } : item
        );
      }
      
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, [toast]);

  const removeItem = useCallback((productId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        toast({
          title: `${itemToRemove.name} removed from cart.`,
        });
      }
      return prevItems.filter(item => item.id !== productId);
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  }, [toast]);

  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);
  
  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    isCartLoading: isLoading, // Renamed for clarity in context
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getCartSubtotal,
    getItemCount,
  };
}
