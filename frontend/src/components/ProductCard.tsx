'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { useToast } from '@/components/ui/use-toast'; // Import useToast
import type { CartItemType } from '@/types/cart'; // Import CartItemType
import { Loader2 } from 'lucide-react'; // Import Loader2

interface Variant {
  variant_id: number;
  sku: string;
  quantity: string; // e.g., "5mg" - this is the variant display name
  price: number; // e.g., 49.99 (in dollars)
  stock: number; // e.g., 15
}

interface ProductCardProps {
  id: string; // This is the product slug
  name: string;
  purity: string;
  variants?: Variant[];
}

export default function ProductCard({ id, name, purity, variants = [] }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  // Initialize with first variant or -1 if no variants
  const [selectedVariant, setSelectedVariant] = useState(() =>
    variants && variants.length > 0 ? 0 : -1
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false); // New state for loading

  // Reset selected variant if variants array changes
  useEffect(() => {
    setSelectedVariant(variants && variants.length > 0 ? 0 : -1);
  }, [variants]);

  // Get current variant and price
  const currentVariant = selectedVariant >= 0 ? variants[selectedVariant] : null;
  const currentPrice = currentVariant?.price || 0; // This is in dollars
  const currentVariantDisplay = currentVariant?.quantity || ''; // e.g. "5mg"
  const currentStock = currentVariant?.stock || 0;

  const isOutOfStock = currentStock <= 0;
  const hasVariants = variants.length > 0;

  // Handle variant selection
  const handleVariantSelect = (index: number) => {
    // console.log('Variant selected:', index); // Keep for debugging if needed
    if (index >= 0 && index < variants.length) {
      setSelectedVariant(index);
      // console.log('State updated to:', index); // Keep for debugging if needed
    }
  };

  const handleAddToCart = () => {
    if (currentVariant && !isOutOfStock) {
      setIsAddingToCart(true);
      const itemDetails: Omit<CartItemType, 'quantity'> = {
        id: currentVariant.sku, // Use variant SKU as the unique cart item ID
        productId: id, // Product slug
        name: name, // Product name
        variant: currentVariant.quantity, // e.g., "5mg"
        sku: currentVariant.sku,
        unitPrice: currentPrice * 100, // Convert dollars to cents
        thumbnailUrl: `/logo.svg`, // Placeholder image, or construct from product data if available
        href: `/products/${id}?variant=${currentVariant.quantity.replace(/\s+/g, '')}`, // e.g. /products/semaglutide?variant=5mg
        stock: currentVariant.stock,
      };
      addToCart(itemDetails, 1); // Add 1 quantity by default
      toast({
        title: 'Added to Cart',
        description: `${name} (${currentVariant.quantity}) was added to your cart.`,
      });
      setIsAddingToCart(false);
    } else if (isOutOfStock) {
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: `${name} (${currentVariant?.quantity}) is currently out of stock.`,
      });
    } else if (!currentVariant) {
      toast({
        variant: 'destructive',
        title: 'No Variant Selected',
        description: `Please select a variant for ${name}.`,
      });
    }
  };

  return (
    <div className="rounded-xs relative space-y-4 overflow-hidden bg-white shadow-md">
      <div className="bg-[#002855] px-6 py-4">
        <div className="space-y-2">
          <a
            href={`/products/${id}`}
            className="text-xl font-bold text-white transition-colors hover:text-gray-300"
          >
            {name}
          </a>
          <div className="text-sm text-white">
            <span
              className={isOutOfStock ? 'font-medium text-[#FF4D4F]' : 'font-medium text-[#A4F600]'}
            >
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
                  'h-auto min-w-[60px] py-2',
                  selectedVariant === index ? 'bg-secondary text-white' : 'hover:bg-secondary/10',
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

      <div className="space-y-4 px-2 pb-6">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="font-medium">Minimum Purity: </span>
            <span>{purity}</span>
          </div>
        </div>

        {hasVariants && (
          <>
            <div className="text-left font-mono text-lg font-bold text-primary">
              ${currentPrice.toFixed(2)}
              {currentVariantDisplay && (
                <span className="ml-1 mt-1 text-sm font-normal">({currentVariantDisplay})</span>
              )}
            </div>
          </>
        )}

        <div className="flex justify-start">
          <Button
            variant={isOutOfStock ? 'outline' : 'default'} // Changed destructive to outline for out of stock
            size="sm"
            disabled={isOutOfStock || !hasVariants || isAddingToCart} // Disable if out of stock, no variants, or adding
            onClick={handleAddToCart}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : isOutOfStock && hasVariants ? (
              'Out of Stock'
            ) : hasVariants ? (
              'Add to Cart'
            ) : (
              'Unavailable'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
