'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Update CartItemType import to DisplayCartItemType and related types
import type { CartItemType, RemovedItemPlaceholderType, DisplayCartItemType } from '@/types/cart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';
// FlaskOutlineIcon import is removed as it's no longer used for a separate empty cart view.

// Define interface for removed item information
// interface RemovedItemInfo { // This was already removed, ensuring it stays removed.
//   name: string;
//   href: string;
// }

// Mock data for initial development
const MOCK_CART_ITEMS_DATA: CartItemType[] = [
  {
    id: 'retatrutide-2mg-1',
    productId: 'retatrutide',
    name: 'Retatrutide',
    variant: '2 mg',
    sku: 'RETATRUTIDE-2MG',
    unitPrice: 9999, // in cents
    quantity: 1,
    thumbnailUrl: 'https://via.placeholder.com/96x96.png?text=Retatrutide',
    href: '/products/retatrutide?variant=2mg',
    stock: 10,
  },
  {
    id: 'semaglutide-5mg-2',
    productId: 'semaglutide',
    name: 'Semaglutide',
    variant: '5 mg',
    sku: 'SEMAGLUTIDE-5MG',
    unitPrice: 14999, // in cents
    quantity: 2,
    thumbnailUrl: 'https://via.placeholder.com/96x96.png?text=Semaglutide',
    href: '/products/semaglutide?variant=5mg',
    stock: 5,
  },
];

const CartPageClient: React.FC = () => {
  // Use DisplayCartItemType for cartItems state
  const [cartItems, setCartItems] = useState<DisplayCartItemType[]>(MOCK_CART_ITEMS_DATA);
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('');
  // RemovedItemInfo state is no longer needed here
  // const [removedItemInfo, setRemovedItemInfo] = useState<RemovedItemInfo | null>(null);

  const clearPlaceholdersAndGetRealItems = (items: DisplayCartItemType[]): CartItemType[] => {
    return items.filter((item): item is CartItemType => 'sku' in item);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    // const currentRealItems = clearPlaceholdersAndGetRealItems(cartItems); // Removed this line
    const updatedItems = cartItems.map(item => {
      if ('sku' in item && item.id === itemId) { // Check if it's a CartItemType
        return { ...item, quantity: Math.max(1, Math.min(newQuantity, item.stock)) };
      }
      return item; // Return placeholders or other items unchanged
    });
    setCartItems(updatedItems);

    const updatedItem = updatedItems.find(
      (item): item is CartItemType => 'sku' in item && item.id === itemId
    );
    if (updatedItem) {
      setLiveRegionMessage(`${updatedItem.name} ${updatedItem.variant} quantity updated to ${newQuantity}.`);
    }
    // No need to setRemovedItemInfo(null) anymore
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = cartItems.find(
      (cartItem): cartItem is CartItemType => 'sku' in cartItem && cartItem.id === itemId
    );

    if (itemToRemove) {
      setLiveRegionMessage(`${itemToRemove.name} ${itemToRemove.variant} removed from cart.`);

      const placeholder: RemovedItemPlaceholderType = {
        type: 'removed-placeholder',
        id: itemToRemove.id, // Use original ID for key and potential undo
        name: itemToRemove.name,
        variant: itemToRemove.variant,
        href: itemToRemove.href,
      };

      setCartItems(prevItems =>
        prevItems.map(ci => (('sku' in ci && ci.id === itemId) ? placeholder : ci))
      );

      // Set a timer to remove this specific placeholder
      // setTimeout(() => {
      //   setCartItems(prev => prev.filter(ci => !(ci.id === placeholder.id && 'type' in ci && ci.type === 'removed-placeholder')));
      // }, 7000); // Remove after 7 seconds
    }
    // No need to setRemovedItemInfo(null) anymore
  };

  const handleCheckout = () => {
    const currentRealItems = clearPlaceholdersAndGetRealItems(cartItems);
    // Placeholder for actual checkout logic
    console.log('Proceeding to checkout with items:', currentRealItems);
    // Potentially redirect to a checkout page or open a payment modal
    setLiveRegionMessage('Proceeding to checkout.');
    // No need to setRemovedItemInfo(null) anymore
    // For now, you might want to clear the cart or show a success message
    // setCartItems([]); // Example: Clear cart after checkout
    alert('Checkout process initiated (simulated). See console for details.');
  };

  const realCartItems = useMemo(() => {
    return cartItems.filter((item): item is CartItemType => 'sku' in item);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return realCartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [realCartItems]);

  const estimatedShipping = 'Calculated at checkout';
  const estimatedTax = 'Calculated at checkout';

  const grandTotal = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  // Condition for showing the empty cart view is removed.
  // const showEmptyCartView = realCartItems.length === 0 && !cartItems.some(item => 'type' in item && item.type === 'removed-placeholder');

  // The main return block will now always be used.
  // The specific empty cart message will be handled within the items list.

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 xl:max-w-[1200px]">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveRegionMessage}
      </div>

      <div className="mb-6">
        <a href="/products" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft size={20} className="mr-2" />
          Continue Shopping
        </a>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">Shopping Cart</h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <section aria-labelledby="cart-items-heading" className="lg:col-span-7">
          <h2 id="cart-items-heading" className="sr-only">
            Items in your shopping cart
          </h2>
          {/* Show desktop header only if there are real items or placeholders to give context */}
          {cartItems.length > 0 && realCartItems.length > 0 && (
            <div className="hidden lg:grid grid-cols-12 gap-x-6 items-center py-2 border-b border-border text-xs text-muted-foreground uppercase font-medium mb-2">
              {/* Price column header, explicitly positioned to the right, using div for block behavior */}
              <div className="lg:col-start-10 lg:col-span-3 text-right px-4">Price</div>
            </div>
          )}
          <ul role="list" className="divide-y divide-border">
            {cartItems.length === 0 ? (
              <li className="py-6 text-center text-muted-foreground">
                Your cart is currently empty.
              </li>
            ) : (
              cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            )}
          </ul>
        </section>

        <OrderSummary
          subtotal={subtotal}
          shippingCostText={estimatedShipping}
          taxText={estimatedTax}
          grandTotal={grandTotal}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
};

export default CartPageClient;