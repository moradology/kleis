'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { CartItemType } from '@/types/cart';
import * as cartManager from '@/lib/cartManager';

// 1. Define State and Action Types
interface CartState {
  items: CartItemType[];
  isInitialized: boolean; // To track if the cart has been loaded from localStorage
}

type CartAction =
  | { type: 'SET_CART'; payload: CartItemType[] }
  | {
      type: 'ADD_ITEM';
      payload: { itemDetails: Omit<CartItemType, 'quantity'>; quantityToAdd: number };
    }
  | { type: 'REMOVE_ITEM'; payload: string } // itemId (sku)
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; newQuantity: number } }
  | { type: 'CLEAR_CART' };

// 2. Initial State
const initialState: CartState = {
  items: [],
  isInitialized: false,
};

// 3. Reducer Function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  let updatedItems: CartItemType[];
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload, isInitialized: true };
    case 'ADD_ITEM':
      updatedItems = cartManager.addItemToCart(
        action.payload.itemDetails,
        action.payload.quantityToAdd
      );
      return { ...state, items: updatedItems };
    case 'REMOVE_ITEM':
      updatedItems = cartManager.removeItemFromCart(action.payload);
      return { ...state, items: updatedItems };
    case 'UPDATE_QUANTITY':
      updatedItems = cartManager.updateItemQuantity(
        action.payload.itemId,
        action.payload.newQuantity
      );
      return { ...state, items: updatedItems };
    case 'CLEAR_CART':
      updatedItems = cartManager.clearCart();
      return { ...state, items: updatedItems };
    default:
      return state;
  }
};

// 4. Create Context
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 5. Create Provider Component
interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    // Initialize cart from localStorage on mount
    dispatch({ type: 'SET_CART', payload: cartManager.getCart() });

    // For cross-tab synchronization, listen to 'storage' event
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === cartManager.LOCAL_STORAGE_CART_KEY_FOR_EVENT) {
        // Cart data in another tab has changed, re-fetch and update context
        dispatch({ type: 'SET_CART', payload: cartManager.getCart() });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
};

// 6. Create Custom Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
