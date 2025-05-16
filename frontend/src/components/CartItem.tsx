import React from 'react';
// Update CartItemType import to DisplayCartItemType and related types
import type { CartItemType, RemovedItemPlaceholderType, DisplayCartItemType } from '@/types/cart';
import QuantitySelector from './QuantitySelector';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react'; // X for mobile remove, Trash2 for desktop
import { cn } from '@/lib/utils';

interface CartItemProps {
  // Update item prop type
  item: DisplayCartItemType;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId:string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  // Check if item is a placeholder for a removed item
  if ('type' in item && item.type === 'removed-placeholder') {
    const removedPlaceholder = item as RemovedItemPlaceholderType;
    return (
      <li className="flex py-6 px-4 my-2 items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          <a href={removedPlaceholder.href} className="font-semibold text-primary hover:underline">
            {removedPlaceholder.name} {removedPlaceholder.variant}
          </a>
          {' '}was removed from your cart.
        </p>
      </li>
    );
  }

  // Cast item to CartItemType for the rest of the component if not a placeholder
  const cartItem = item as CartItemType;

  const handleQuantityChange = (newQuantity: number) => {
    onUpdateQuantity(cartItem.id, newQuantity);
  };

  return (
    <li className="flex flex-col py-6 sm:py-8 px-2 sm:px-4">
      {/* Desktop View: Two Rows */}
      {/* Desktop Row 1: Product Info, Unit Price, Remove Button */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-x-6 lg:items-center">
        {/* Product Info (Name/Variant) */}
        <div className="lg:col-span-9"> {/* Adjusted from lg:col-span-8 */}
          <h3 className="text-base font-medium text-primary hover:text-primary/80">
            <a href={cartItem.href}>{cartItem.name}</a>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{cartItem.variant}</p>
        </div>

        {/* Desktop Unit Price */}
        <div className="lg:col-span-3 lg:text-right lg:pl-4">
          <p className="text-sm font-medium text-foreground">
            ${(cartItem.unitPrice / 100).toFixed(2)}
          </p>
        </div>
        
        {/* Desktop Remove Button - REMOVED */}
        {/*
        <div className="lg:col-span-1 lg:flex lg:justify-end lg:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveItem(cartItem.id)}
            aria-label={`Remove ${cartItem.name} from cart`}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
        */}
      </div>

      {/* Desktop Row 2: Quantity Selector */}
      <div className="hidden lg:block mt-3"> {/* Added mt-3 for spacing */}
        <QuantitySelector
          id={`quantity-desktop-${cartItem.id}`}
          initialQuantity={cartItem.quantity}
          maxQuantity={cartItem.stock}
          onQuantityChange={handleQuantityChange}
          onDeleteItem={() => onRemoveItem(cartItem.id)} // Pass onDeleteItem
          className="h-9" // Removed w-32, height is now h-9 by default in QuantitySelector
        />
      </div>

      {/* Mobile View: Stacked Layout */}
      <div className="lg:hidden flex flex-col">
        {/* Product Info (Name/Variant) */}
        <div className="mb-2"> {/* Reduced mb-4 to mb-2 */}
          <h3 className="text-base font-medium text-primary hover:text-primary/80">
            <a href={cartItem.href}>{cartItem.name}</a>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{cartItem.variant}</p>
        </div>

        {/* Mobile Unit Price */}
        <p className="text-sm text-muted-foreground mb-3"> {/* Added mb-3 */}
          ${(cartItem.unitPrice / 100).toFixed(2)} each
        </p>

        {/* Mobile Quantity Selector */}
        <div className="mb-3"> {/* Added mb-3 */}
          <QuantitySelector
            id={`quantity-mobile-${cartItem.id}`}
            initialQuantity={cartItem.quantity}
            maxQuantity={cartItem.stock}
            onQuantityChange={handleQuantityChange}
            onDeleteItem={() => onRemoveItem(cartItem.id)} // Pass onDeleteItem
            className="h-9" // Removed w-32
          />
        </div>
        
        {/* Mobile Remove Button - REMOVED */}
        {/*
        <div className="flex justify-start">
          <Button
            variant="ghost"
            className="p-0 text-muted-foreground hover:text-destructive h-auto"
            onClick={() => onRemoveItem(cartItem.id)}
            aria-label={`Remove ${cartItem.name} from cart`}
          >
            <X className="h-4 w-4" />
            <span className="ml-1 text-xs">Remove</span>
          </Button>
        </div>
        */}
      </div>
    </li>
  );
};

export default CartItem;