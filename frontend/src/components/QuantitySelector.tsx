'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  id: string; // For ARIA attributes
  initialQuantity: number;
  maxQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
  onDeleteItem?: () => void;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  id,
  initialQuantity,
  maxQuantity,
  onQuantityChange,
  onDeleteItem,
  className,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    updateQuantity(value);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    updateQuantity(value);
  };

  const updateQuantity = (newQuantity: number) => {
    const validatedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validatedQuantity);
    onQuantityChange(validatedQuantity);
  };

  const increment = () => {
    updateQuantity(quantity + 1);
  };

  const decrement = () => {
    updateQuantity(quantity - 1);
  };

  return (
    <div className={cn('flex h-9 items-center', className)}>
      {' '}
      {/* Main container is now just flex */}
      {/* Quantity adjustment group */}
      <div className="flex h-full items-center rounded-md border border-input">
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-8 rounded-r-none border-r border-input hover:bg-muted/50"
          onClick={decrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          aria-controls={id}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          id={id}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min="1"
          max={maxQuantity}
          className="h-full w-10 rounded-none border-none px-1 text-center text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Item quantity"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-8 rounded-l-none border-l border-input hover:bg-muted/50"
          onClick={increment}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          aria-controls={id}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {/* Separator and Delete button */}
      {onDeleteItem && (
        <>
          {/* <span className="mx-2 text-muted-foreground">|</span> */} {/* Old pipe separator */}
          <div className="mx-2 h-5 w-px self-center bg-border"></div>{' '}
          {/* New vertical line separator */}
          <Button
            variant="ghost"
            className="h-full w-auto px-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onDeleteItem}
            aria-label="Remove item"
          >
            Delete
          </Button>
        </>
      )}
    </div>
  );
};

export default QuantitySelector;
