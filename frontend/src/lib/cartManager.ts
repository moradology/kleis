import type { CartItemType } from '@/types/cart';

export const LOCAL_STORAGE_CART_KEY_FOR_EVENT = 'kleisCart'; // Renamed for clarity if used in events
const LOCAL_STORAGE_CART_KEY = 'kleisCart'; // Original key for direct use

const dispatchCartUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
};

/**
 * Retrieves the cart from Local Storage.
 * @returns {CartItemType[]} An array of cart items, or an empty array if no cart exists or data is corrupted.
 */
export const getCart = (): CartItemType[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []; // LocalStorage not available (SSR or old browser)
  }

  try {
    const serializedCart = window.localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    if (serializedCart === null) {
      return []; // No cart found
    }
    const items = JSON.parse(serializedCart) as CartItemType[];
    // Basic validation to ensure it's an array
    if (!Array.isArray(items)) {
      console.error('Corrupted cart data in LocalStorage: not an array. Clearing.');
      window.localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      return [];
    }
    // Further validation for each item structure could be added here if necessary
    return items;
  } catch (error) {
    console.error('Error parsing cart from LocalStorage:', error);
    // Attempt to clear corrupted data
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      dispatchCartUpdateEvent(); // Dispatch event even if clearing corrupted data
    } catch (removeError) {
      console.error('Error removing corrupted cart data from LocalStorage:', removeError);
    }
    return []; // Return empty cart on error
  }
};

/**
 * Saves the cart to Local Storage.
 * @param {CartItemType[]} items - The array of cart items to save.
 */
export const saveCart = (items: CartItemType[]): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('LocalStorage not available. Cart not saved.');
    return;
  }

  try {
    const serializedCart = JSON.stringify(items);
    window.localStorage.setItem(LOCAL_STORAGE_CART_KEY, serializedCart);
    dispatchCartUpdateEvent(); // Dispatch event after successful save
  } catch (error) {
    console.error('Error saving cart to LocalStorage:', error);
    // Handle potential errors like quota exceeded
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      alert(
        'Could not save cart: Local storage quota exceeded. Please clear some space or contact support.'
      );
    } else {
      alert('An unexpected error occurred while saving your cart. Please try again.');
    }
  }
};

/**
 * Clears the cart from Local Storage.
 * @returns {CartItemType[]} An empty array, representing the cleared cart.
 */
export const clearCart = (): CartItemType[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    window.localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    dispatchCartUpdateEvent(); // Dispatch event after successful removal
  } catch (error) {
    console.error('Error clearing cart from LocalStorage:', error);
    // Even if removal fails, conceptually the cart should be empty for the session
  }
  return [];
};

/**
 * Adds an item to the cart or updates its quantity if it already exists.
 * The itemDetails.id should be the SKU of the variant.
 * @param {Omit<CartItemType, 'quantity'>} itemDetails - The details of the item to add.
 * @param {number} quantityToAdd - The quantity to add.
 * @returns {CartItemType[]} The updated cart items.
 */
export const addItemToCart = (
  itemDetails: Omit<CartItemType, 'quantity'>,
  quantityToAdd: number
): CartItemType[] => {
  if (quantityToAdd <= 0) return getCart(); // Do nothing if quantity is not positive

  const currentCart = getCart();
  const existingItemIndex = currentCart.findIndex(
    (item) => item.id === itemDetails.id // itemDetails.id is expected to be the SKU
  );

  if (existingItemIndex > -1) {
    // Item exists, update quantity
    const existingItem = currentCart[existingItemIndex];
    const newQuantity = Math.min(
      existingItem.quantity + quantityToAdd,
      existingItem.stock // Use stock of the item already in cart
    );
    currentCart[existingItemIndex] = { ...existingItem, quantity: newQuantity };
  } else {
    // Item does not exist, add new item
    // Ensure the quantity does not exceed the available stock for the new item
    const newItemQuantity = Math.min(quantityToAdd, itemDetails.stock);
    if (newItemQuantity > 0) {
      // Only add if there's stock and quantity is positive
      currentCart.push({ ...itemDetails, quantity: newItemQuantity });
    }
  }

  saveCart(currentCart);
  return currentCart;
};

/**
 * Removes an item from the cart.
 * @param {string} itemId - The ID (SKU) of the item to remove.
 * @returns {CartItemType[]} The updated cart items.
 */
export const removeItemFromCart = (itemId: string): CartItemType[] => {
  const currentCart = getCart();
  const updatedCart = currentCart.filter((item) => item.id !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

/**
 * Updates the quantity of an item in the cart.
 * If newQuantity is 0 or less, the item is removed.
 * @param {string} itemId - The ID (SKU) of the item to update.
 * @param {number} newQuantity - The new quantity for the item.
 * @returns {CartItemType[]} The updated cart items.
 */
export const updateItemQuantity = (itemId: string, newQuantity: number): CartItemType[] => {
  const currentCart = getCart();
  const itemIndex = currentCart.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return currentCart; // Item not found
  }

  if (newQuantity <= 0) {
    // Remove item if quantity is zero or less
    const updatedCart = currentCart.filter((item, index) => index !== itemIndex);
    saveCart(updatedCart);
    return updatedCart;
  }

  const itemToUpdate = currentCart[itemIndex];
  const validatedQuantity = Math.min(newQuantity, itemToUpdate.stock); // Cap by stock

  currentCart[itemIndex] = { ...itemToUpdate, quantity: Math.max(1, validatedQuantity) }; // Ensure quantity is at least 1

  saveCart(currentCart);
  return currentCart;
};

/**
 * Gets the total number of items in the cart (sum of quantities).
 * @returns {number} The total count of items.
 */
export const getCartItemCount = (): number => {
  const currentCart = getCart();
  return currentCart.reduce((total, item) => total + item.quantity, 0);
};
