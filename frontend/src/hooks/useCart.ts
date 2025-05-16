import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { cartStore } from '../lib/cartStore';
import type { CartItemType } from '../types/cart';

// The subscribe function for useSyncExternalStore needs to be stable.
const subscribe = cartStore.subscribe;

// Simple debug flag. In a larger app, this might come from an environment variable.
const DEBUG_CART = process.env.NODE_ENV === 'development';

/**
 * @typedef {object} CartHookReturn
 * @property {CartItemType[]} items - The current items in the cart.
 * @property {(itemDetails: Omit<CartItemType, 'quantity'>, quantityToAdd: number) => void} addToCart - Adds an item to the cart or updates its quantity.
 * @property {(itemId: string) => void} removeFromCart - Removes an item from the cart.
 * @property {(itemId: string, newQuantity: number) => void} updateItemQuantity - Updates the quantity of an item in the cart.
 * @property {() => void} clearCart - Clears all items from the cart.
 * @property {(newCart: CartItemType[]) => void} setCart - Replaces the entire cart with a new set of items.
 * @property {number} itemCount - The total number of individual items in the cart (sum of quantities).
 * @property {number} totalPrice - The total price of all items in the cart (in cents).
 * @property {(itemId: string) => CartItemType | undefined} getItemById - Retrieves a specific item from the cart by its ID.
 * @property {(itemId: string) => boolean} isItemInCart - Checks if an item is in the cart by its ID.
 */

/**
 * Custom React hook to interact with the cart.
 * Provides cart state and functions to modify the cart.
 * @returns {CartHookReturn} An object containing cart state and action functions.
 */
export function useCart() {
  const items = useSyncExternalStore(
    subscribe,
    cartStore.getSnapshot,
    () => [] // Server snapshot: initial empty cart for SSR
  );

  /**
   * Adds an item to the cart or updates its quantity if it already exists.
   * @param {Omit<CartItemType, 'quantity'>} itemDetails - The details of the item to add.
   * @param {number} quantityToAdd - The quantity to add.
   */
  const addToCart = useCallback(
    (itemDetails: Omit<CartItemType, 'quantity'>, quantityToAdd: number) => {
      cartStore.addItem(itemDetails, quantityToAdd);
      if (DEBUG_CART) console.log('Cart after addToCart:', cartStore.getSnapshot());
    },
    []
  );

  /**
   * Removes an item from the cart.
   * @param {string} itemId - The ID of the item to remove.
   */
  const removeFromCart = useCallback((itemId: string) => {
    cartStore.removeItem(itemId);
    if (DEBUG_CART) console.log('Cart after removeFromCart:', cartStore.getSnapshot());
  }, []);

  /**
   * Updates the quantity of an item in the cart.
   * If newQuantity is 0 or less, the item is removed.
   * @param {string} itemId - The ID of the item to update.
   * @param {number} newQuantity - The new quantity for the item.
   */
  const updateItemQuantity = useCallback((itemId: string, newQuantity: number) => {
    cartStore.updateItemQuantity(itemId, newQuantity);
    if (DEBUG_CART) console.log('Cart after updateItemQuantity:', cartStore.getSnapshot());
  }, []);

  /**
   * Clears all items from the cart.
   */
  const clearCart = useCallback(() => {
    cartStore.clearCart();
    if (DEBUG_CART) console.log('Cart after clearCart:', cartStore.getSnapshot());
  }, []);

  /**
   * Replaces the entire cart with a new set of items.
   * @param {CartItemType[]} newCart - The new cart state.
   */
  const setCart = useCallback((newCart: CartItemType[]) => {
    cartStore.setCart(newCart);
    if (DEBUG_CART) console.log('Cart after setCart:', cartStore.getSnapshot());
  }, []);

  /**
   * The total number of individual items in the cart (sum of quantities).
   * @type {number}
   */
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  /**
   * The total price of all items in the cart (in cents).
   * @type {number}
   */
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  /**
   * Retrieves a specific item from the cart by its ID.
   * @param {string} itemId - The ID of the item to retrieve.
   * @returns {CartItemType | undefined} The cart item if found, otherwise undefined.
   */
  const getItemById = useCallback(
    (itemId: string): CartItemType | undefined => {
      return items.find((item) => item.id === itemId);
    },
    [items]
  );

  /**
   * Checks if an item is in the cart by its ID.
   * @param {string} itemId - The ID of the item to check.
   * @returns {boolean} True if the item is in the cart, false otherwise.
   */
  const isItemInCart = useCallback(
    (itemId: string): boolean => {
      return items.some((item) => item.id === itemId);
    },
    [items]
  );

  return {
    items,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    setCart,
    itemCount,
    totalPrice,
    getItemById,
    isItemInCart,
  };
}
