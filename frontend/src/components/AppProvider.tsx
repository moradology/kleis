'use client';

import React from 'react'; // Removed ReactNode from named imports
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster'; // Keep Toaster here for global access

interface AppProviderProps {
  children: React.ReactNode; // Changed from ReactNode to React.ReactNode
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <CartProvider>
      {children}
      <Toaster /> {/* Toaster can be part of the global providers */}
    </CartProvider>
  );
};

export default AppProvider;
