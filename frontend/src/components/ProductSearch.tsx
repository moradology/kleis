'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
  hasResults: boolean; // Add new prop
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  searchTerm,
  onSearchChange,
  className,
  hasResults,
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          'pl-10',
          hasResults ? 'focus-visible:ring-lime' : 'focus-visible:ring-error' // Conditional ring color
        )}
      />
    </div>
  );
};

export default ProductSearch;
