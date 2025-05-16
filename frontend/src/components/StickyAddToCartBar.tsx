'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCart, Loader2 } from 'lucide-react'; // Import Loader2

interface SelectedVariantInfo {
  productName: string;
  sku: string;
  mg: number;
  price_cents: number;
  stock: number;
}

interface StickyAddToCartBarProps {
  selectedVariantInfo: SelectedVariantInfo | null;
  onAddToCart: (sku: string, quantity: number) => void;
  isAddingToCart: boolean; // New prop for loading state
}

const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  selectedVariantInfo,
  onAddToCart,
  isAddingToCart, // Destructure isAddingToCart
}) => {
  if (!selectedVariantInfo) {
    return null;
  }

  const { productName, sku, mg, price_cents, stock } = selectedVariantInfo;
  const isOutOfStock = stock <= 0;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden', // Hidden on medium screens and up
        'border-t border-border bg-background p-3 shadow-lg'
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0 flex-shrink">
          <p
            className="truncate text-sm font-semibold text-primary"
            title={`${productName} - ${mg}mg`}
          >
            {productName} - {mg}mg
          </p>
          <p className="text-lg font-bold text-foreground">${(price_cents / 100).toFixed(2)}</p>
        </div>
        <Button
          onClick={() => onAddToCart(sku, 1)}
          disabled={isOutOfStock || isAddingToCart} // Disable if out of stock or adding
          className="w-auto flex-shrink-0" // Adjusted width
          size="lg"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding...
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickyAddToCartBar;
