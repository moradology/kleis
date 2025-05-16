'use client';

import React from 'react';
import type { RelatedProductSummary } from '@/types/product';
import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils'; // Unused

interface RelatedProductCardProps {
  product: RelatedProductSummary;
}

const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ product }) => {
  const priceRange =
    product.min_price_cents === product.max_price_cents
      ? `$${(product.min_price_cents / 100).toFixed(2)}`
      : `$${(product.min_price_cents / 100).toFixed(2)} - $${(product.max_price_cents / 100).toFixed(2)}`;

  const stockStatusText =
    product.overall_stock_status === 'Low Stock' ? 'Low Stock' : product.overall_stock_status;
  const stockStatusColor =
    product.overall_stock_status === 'In Stock'
      ? 'bg-lime text-navy'
      : product.overall_stock_status === 'Low Stock'
        ? 'bg-yellow-400 text-yellow-900'
        : 'bg-destructive text-destructive-foreground';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Optional: Add an image here if available in RelatedProductSummary */}
      {/* <img src={product.image_url || '/placeholder.png'} alt={product.name} className="w-full h-32 object-cover"/> */}
      <div className="flex flex-grow flex-col p-4">
        <a
          href={`/products/${product.slug}`}
          className="mb-1 text-lg font-semibold text-primary hover:underline"
        >
          {product.name}
        </a>
        {product.purity_percent && (
          <p className="mb-2 text-xs text-muted-foreground">Purity: ≥{product.purity_percent}%</p>
        )}
        <p className="mb-2 font-mono text-sm text-foreground/80">{priceRange}</p>

        <div className="mt-auto">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${stockStatusColor} mb-3`}
          >
            {stockStatusText}
          </span>
          <Button asChild variant="outline" size="sm" className="w-full">
            <a href={`/products/${product.slug}`}>View Details</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductCard;