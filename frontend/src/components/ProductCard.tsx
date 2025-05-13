'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Variant {
  variant_id: number;
  sku: string;
  quantity: string;
  price: number;
  stock: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  purity: string;
  variants?: Variant[];
}

export default function ProductCard({
  id,
  name,
  purity,
  variants = []
}: ProductCardProps) {
  // Initialize with first variant or -1 if no variants
  const [selectedVariant, setSelectedVariant] = useState(() =>
    variants && variants.length > 0 ? 0 : -1
  );
  
  // Reset selected variant if variants array changes
  useEffect(() => {
    setSelectedVariant(variants && variants.length > 0 ? 0 : -1);
  }, [variants]);
  
  // Get current variant and price
  const currentVariant = selectedVariant >= 0 ? variants[selectedVariant] : null;
  const currentPrice = currentVariant?.price || 0;
  const currentQuantity = currentVariant?.quantity || '';
  const currentStock = currentVariant?.stock || 0;

  const isOutOfStock = currentStock <= 0;
  const hasVariants = variants.length > 0;

  // Handle variant selection
  const handleVariantSelect = (index: number) => {
    console.log('Variant selected:', index);
    if (index >= 0 && index < variants.length) {
      setSelectedVariant(index);
      console.log('State updated to:', index);
    }
  };

  return (
    <div className="bg-white rounded-xs space-y-4 relative shadow-md overflow-hidden">
      <div className="bg-[#002855] px-6 py-4">
        <div className="space-y-2">
          <a href={`/products/${id}`} className="text-xl font-bold text-white hover:text-[#A4F600] transition-colors">
            {name}
          </a>
          <div className="text-sm text-white">
            <span className={isOutOfStock
              ? 'text-[#FF4D4F] font-medium'
              : 'text-[#A4F600] font-medium'}>
              {isOutOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>
        </div>
      </div>

      {hasVariants && (
        <>
          <div className="flex justify-center gap-2">
            {variants.map((variant, index) => (
              <Button
                key={index}
                variant={selectedVariant === index ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-auto py-2 min-w-[60px]',
                  selectedVariant === index
                    ? 'bg-secondary text-white'
                    : 'hover:bg-secondary/10',
                  // Apply dashed border when out of stock
                  variant.stock <= 0 && 'border-dashed',
                  // Apply washed-out text when out of stock AND not selected
                  variant.stock <= 0 && selectedVariant !== index && 'text-gray-400 opacity-70'
                )}
                onClick={() => handleVariantSelect(index)}
              >
                {variant.quantity}
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="px-2 pb-6 space-y-4">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="font-medium">Minimum Purity: </span>
            <span>{purity}</span>
          </div>
        </div>

        {hasVariants && (
          <>
            <div className="text-lg font-bold font-mono text-primary text-left">
              ${currentPrice.toFixed(2)}
              {currentQuantity && <span className="ml-1 mt-1 text-sm font-normal">({currentQuantity})</span>}
            </div>
          </>
        )}

        <div className="flex justify-start">
          <Button
            variant={isOutOfStock ? "destructive" : "default"}
            size="sm"
            disabled={isOutOfStock}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}