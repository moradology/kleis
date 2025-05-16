'use client';

import React, { useState, useEffect } from 'react';
import type { RelatedProductSummary, CategoryInfo } from '@/types/product';
import RelatedProductCard from './RelatedProductCard';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

interface RelatedProductsProps {
  currentProductSlug: string;
  // categories are not strictly needed if the API handles logic based on slug
  // categories: CategoryInfo[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductSlug }) => {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${currentProductSlug}/related`);
        if (!response.ok) {
          throw new Error(`Failed to fetch related products: ${response.statusText}`);
        }
        const data: RelatedProductSummary[] = await response.json();
        setRelatedProducts(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductSlug]);

  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Related Compounds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/4 mb-3" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-4 border border-destructive/50 bg-destructive/10 rounded-md">
        <h2 className="text-xl font-semibold mb-2 text-destructive">Related Compounds</h2>
        <p className="text-destructive-foreground">Could not load related products: {error}</p>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Or a message like "No related products found."
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold mb-6 text-primary">Related Compounds</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <RelatedProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;