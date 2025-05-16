import React from 'react';
import type { CartItemType } from '@/types/cart';
import { formatPrice } from '@/lib/utils';
import QuantitySelector from './QuantitySelector'; // Import QuantitySelector
import { useCart } from '@/hooks/useCart'; // Import useCart

interface CartPreviewItemProps {
  item: CartItemType;
}

const CartPreviewItem: React.FC<CartPreviewItemProps> = ({ item }) => {
  const { updateItemQuantity, removeFromCart } = useCart(); // Get cart actions

  const handleQuantityChange = (newQuantity: number) => {
    updateItemQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = () => {
    removeFromCart(item.id);
  };

  return (
    <li className="flex items-start py-3">
      <div className="ml-0 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-sm font-medium text-primary">
            <h3>
              <a href={item.href} className="hover:underline">
                {item.name}
              </a>
            </h3>
            <p className="ml-4">{formatPrice(item.unitPrice)}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.variant}</p>
        </div>
        <div className="mt-2 flex flex-1 items-end justify-between text-xs">
          {/* Replace static quantity display with QuantitySelector */}
          <QuantitySelector
            id={`preview-quantity-${item.id}`}
            initialQuantity={item.quantity}
            maxQuantity={item.stock}
            onQuantityChange={handleQuantityChange}
            onDeleteItem={handleRemoveItem}
            className="h-8" // Slightly smaller height for preview
          />
          {/* Optional: Add a quick remove button here if desired in future - covered by QuantitySelector's delete */}
        </div>
      </div>
    </li>
  );
};

export default CartPreviewItem;