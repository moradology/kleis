import React from 'react';
import { useCart } from '@/hooks/useCart';
import CartPreviewItem from './CartPreviewItem';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils'; // Assuming a utility for price formatting

const CartPreview: React.FC = () => {
  const { items, totalPrice, itemCount } = useCart();

  return (
    <div className="absolute right-0 top-full mt-1 w-80 rounded-md border border-border bg-card shadow-xl">
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {itemCount === 0 ? (
          <div className="py-6 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-primary">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add items to your cart to see them here.
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h3>
            <ul role="list" className="-my-3 divide-y divide-border">
              {items.map((item) => (
                <CartPreviewItem key={item.id} item={item} />
              ))}
            </ul>
          </>
        )}
      </div>
      {itemCount > 0 && (
        <div className="border-t border-border p-4">
          <div className="mb-3 flex justify-between text-base font-medium text-primary">
            <p>Subtotal</p>
            <p>{formatPrice(totalPrice)}</p>
          </div>
          <Button asChild className="w-full" size="lg">
            <a href="/cart">View Cart & Checkout</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPreview;