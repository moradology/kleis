'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ProductSearch from './ProductSearch';
import ProductCard from './ProductCard';

// Define ProductData interface matching the structure from products.astro
interface ProductVariant {
  variant_id: number;
  sku: string;
  quantity: string; // e.g., "5mg"
  price: number; // e.g., 49.99
  stock: number; // e.g., 15
}

export interface ProductData {
  // Exporting for potential use elsewhere
  id: string; // Using substance_slug for the ID
  name: string;
  description: string; // Add description field
  purity: string;
  variants: ProductVariant[];
}

interface ProductsDisplayProps {
  initialProducts: ProductData[];
}

const ProductsDisplay: React.FC<ProductsDisplayProps> = ({ initialProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Effect to initialize searchTerm from URL query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const querySearchTerm = params.get('search');
      if (querySearchTerm) {
        setSearchTerm(querySearchTerm);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to update URL query parameter when searchTerm changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      const newPath = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({ path: newPath }, '', newPath);
    }
  }, [searchTerm]); // This effect runs whenever searchTerm changes

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return initialProducts;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    // Searching in both name and description
    return initialProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedSearchTerm) ||
        (product.description && product.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [initialProducts, searchTerm]);

  const hasResults = filteredProducts.length > 0;

  return (
    <div>
      <ProductSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        className="mb-8"
        hasResults={hasResults} // Pass the hasResults prop
      />
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              purity={product.purity}
              variants={product.variants}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          {' '}
          {/* Wrapper for "no results" */}
          <p className="text-muted-foreground">No products match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsDisplay;
