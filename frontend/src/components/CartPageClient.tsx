'use client';

import React, { useState } from 'react';
// Update CartItemType import to DisplayCartItemType and related types
// import type { CartItemType, RemovedItemPlaceholderType, DisplayCartItemType } from '@/types/cart';
// import type { CartItemType } from '@/types/cart'; // Unused, items from useCart are typed
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react'; // Added Trash2 for Clear Cart
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { useToast } from '@/components/ui/use-toast'; // Import useToast
// FlaskOutlineIcon import is removed as it's no longer used for a separate empty cart view.

// Define interface for removed item information
// interface RemovedItemInfo { // This was already removed, ensuring it stays removed.
//   name: string;
//   href: string;
// }

// Mock data for initial development - REMOVED
// const MOCK_CART_ITEMS_DATA: CartItemType[] = [ ... ];

const CartPageClient: React.FC = () => {
  // Use DisplayCartItemType for cartItems state - REMOVED
  // const [cartItems, setCartItems] = useState<DisplayCartItemType[]>(MOCK_CART_ITEMS_DATA);
  const {
    items: cartItems, // Renaming for consistency with previous code structure
    updateItemQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    // itemCount // itemCount from useCart can be used if needed directly
  } = useCart();
  const { toast } = useToast();

  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('');
  // RemovedItemInfo state is no longer needed here
  // const [removedItemInfo, setRemovedItemInfo] = useState<RemovedItemInfo | null>(null);

  // Removed clearPlaceholdersAndGetRealItems function

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateItemQuantity(itemId, newQuantity);
    const updatedItem = cartItems.find((item) => item.id === itemId);
    if (updatedItem) {
      setLiveRegionMessage(
        `${updatedItem.name} ${updatedItem.variant} quantity updated to ${newQuantity}.`
      );
      toast({
        title: 'Quantity Updated',
        description: `${updatedItem.name} ${updatedItem.variant} quantity set to ${newQuantity}.`,
      });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = cartItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      removeFromCart(itemId);
      setLiveRegionMessage(`${itemToRemove.name} ${itemToRemove.variant} removed from cart.`);
      toast({
        title: 'Item Removed',
        description: `${itemToRemove.name} ${itemToRemove.variant} has been removed from your cart.`,
        variant: 'destructive',
      });
    }
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      clearCart();
      setLiveRegionMessage('All items removed from cart.');
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from your cart.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = () => {
    // const currentRealItems = clearPlaceholdersAndGetRealItems(cartItems); // No longer needed
    // Placeholder for actual checkout logic
    console.log('Proceeding to checkout with items:', cartItems);
    // Potentially redirect to a checkout page or open a payment modal
    setLiveRegionMessage('Proceeding to checkout.');
    // Simulate successful checkout
    // For now, you might want to clear the cart or show a success message

    // Simulate API call for checkout
    new Promise((resolve) => setTimeout(resolve, 1500))
      .then(() => {
        // Assuming checkout was successful
        clearCart(); // Clear the cart
        toast({
          title: 'Checkout Successful (Simulated)',
          description: 'Your order has been placed and your cart has been cleared.',
        });
        setLiveRegionMessage('Checkout successful. Cart cleared.');
        // Potentially redirect to an order confirmation page
        // window.location.href = '/order-confirmation';
      })
      .catch((error) => {
        console.error('Simulated checkout error:', error);
        toast({
          variant: 'destructive',
          title: 'Checkout Failed (Simulated)',
          description: 'Something went wrong during checkout. Please try again.',
        });
        setLiveRegionMessage('Checkout failed.');
      });
  };

  // realCartItems is now just cartItems from the hook
  // const realCartItems = useMemo(() => {
  //   return cartItems.filter((item): item is CartItemType => 'sku' in item);
  // }, [cartItems]);

  // subtotal is totalPrice from the hook
  // const subtotal = useMemo(() => {
  //   return realCartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  // }, [realCartItems]);
  const subtotal = totalPrice;

  const estimatedShipping = 'Calculated at checkout';
  const estimatedTax = 'Calculated at checkout';

  // grandTotal is also totalPrice from the hook (assuming no shipping/tax yet)
  // const grandTotal = useMemo(() => {
  //   return subtotal;
  // }, [subtotal]);
  const grandTotal = totalPrice;

  // The main return block will now always be used.
  // The specific empty cart message will be handled within the items list.

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-[1200px]">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveRegionMessage}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href="/products" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </a>
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">Shopping Cart</h1>
        </div>
        {cartItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="mt-4 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:mt-0"
            aria-label="Clear all items from cart"
          >
            <Trash2 size={16} className="mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <section aria-labelledby="cart-items-heading" className="lg:col-span-7">
          <h2 id="cart-items-heading" className="sr-only">
            Items in your shopping cart
          </h2>
          {/* Show desktop header only if there are real items or placeholders to give context */}
          {cartItems.length > 0 && (
            <div className="mb-2 hidden grid-cols-12 items-center gap-x-6 border-b border-border py-2 text-xs font-medium uppercase text-muted-foreground lg:grid">
              {/* Price column header, explicitly positioned to the right, using div for block behavior */}
              <div className="px-4 text-right lg:col-span-3 lg:col-start-10">Price</div>
            </div>
          )}
          <ul className="divide-y divide-border">
            {cartItems.length === 0 ? (
              <li className="py-10 text-center">
                <img
                  src="/open-garage.png"
                  alt="Empty Cart"
                  className="mx-auto mb-4 h-40 w-40 opacity-70"
                />
                <p className="mb-2 text-xl font-semibold text-primary">Your Cart is Empty</p>
                <p className="mb-6 text-muted-foreground">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <Button asChild>
                  <a href="/products">Start Shopping</a>
                </Button>
              </li>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item} // item is now CartItemType
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            )}
          </ul>
        </section>

        {cartItems.length > 0 && (
          <OrderSummary
            subtotal={subtotal}
            shippingCostText={estimatedShipping}
            taxText={estimatedTax}
            grandTotal={grandTotal}
            onCheckout={handleCheckout}
          />
        )}
      </div>
    </div>
  );
};

export default CartPageClient;