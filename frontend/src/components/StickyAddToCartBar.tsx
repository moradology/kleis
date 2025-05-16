'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

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
}

const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  selectedVariantInfo,
  onAddToCart,
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
        'bg-background border-t border-border shadow-lg p-3'
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex-shrink min-w-0">
          <p className="text-sm font-semibold text-primary truncate" title={`${productName} - ${mg}mg`}>
            {productName} - {mg}mg
          </p>
          <p className="text-lg font-bold text-foreground">
            ${(price_cents / 100).toFixed(2)}
          </p>
        </div>
        <Button
          onClick={() => onAddToCart(sku, 1)}
          disabled={isOutOfStock}
          className="flex-shrink-0 w-auto" // Adjusted width
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default StickyAddToCartBar;