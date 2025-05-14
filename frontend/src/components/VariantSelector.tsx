'use client';

import React from 'react';
import type { ProductVariantDetail, VariantStockInfo } from '@/types/product';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCart, Info } from 'lucide-react';
import NotifyMeForm from './NotifyMeForm';

interface VariantSelectorProps {
  variants: ProductVariantDetail[];
  liveVariantsStock?: VariantStockInfo[];
  selectedVariantSku: string | null;
  onSelectVariant: (sku: string) => void;
  onAddToCart: (sku: string, quantity: number) => void;
  productSlug: string; // Add productSlug prop
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  liveVariantsStock,
  selectedVariantSku,
  onSelectVariant,
  onAddToCart,
  productSlug, // Destructure productSlug
}) => {
  if (!variants || variants.length === 0) {
    return <p className="text-muted-foreground">No variants available for this product.</p>;
  }

  const getVariantStock = (sku: string): number => {
    const stockInfo = liveVariantsStock?.find(vs => vs.sku === sku);
    // Fallback to initial variant total_stock if live data is not yet available or doesn't include the SKU
    const initialVariant = variants.find(v => v.sku === sku);
    return stockInfo?.total_stock ?? initialVariant?.total_stock ?? 0;
  };
  
  const selectedVariantDetails = variants.find(v => v.sku === selectedVariantSku);
  const isSelectedVariantOutOfStock = selectedVariantDetails ? getVariantStock(selectedVariantDetails.sku) <= 0 : true;

  return (
    <div className=""> {/* Removed my-6 */}
      <h2 className="text-xl font-semibold mb-2 text-primary">Select Variant</h2>
      <div className="flex flex-wrap gap-x-2 gap-y-2 mb-3"> {/* Changed mb-4 to mb-3 */}
        {variants.map((variant) => {
          const stock = getVariantStock(variant.sku);
          const isSelected = selectedVariantSku === variant.sku;
          const isOutOfStock = stock <= 0;

          return (
            <Button
              key={variant.sku}
              variant={isSelected ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'h-auto py-1.5 px-3 flex flex-col items-start min-w-[100px] relative',
                isSelected && 'ring-2 ring-primary ring-offset-2',
                isOutOfStock && !isSelected && 'border-dashed text-muted-foreground opacity-70',
                isOutOfStock && isSelected && 'border-dashed bg-destructive/80 hover:bg-destructive/70'
              )}
              onClick={() => onSelectVariant(variant.sku)}
            >
              <span className="font-semibold">{variant.mg}mg</span>
              <span className="text-sm">${(variant.price_cents / 100).toFixed(2)}</span>
            </Button>
          );
        })}
      </div>

      {selectedVariantDetails && (
        <div className="mt-3"> {/* Added wrapper div with mt-3 */}
          {isSelectedVariantOutOfStock ? (
            <NotifyMeForm productSlug={productSlug} variantSku={selectedVariantDetails.sku} />
          ) : (
            <div className="p-4 border rounded-lg bg-muted/20"> {/* Removed mt-4, parent div handles margin */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Selected: {selectedVariantDetails.mg}mg
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${(selectedVariantDetails.price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => onAddToCart(selectedVariantDetails.sku, 1)}
                  className="w-full sm:w-auto"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantSelector;