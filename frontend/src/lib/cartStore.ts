import type { CartItemType } from '../types/cart';

const CART_STORAGE_KEY = 'kleisCart';
const MAX_CART_ITEMS = 50; // Maximum number of distinct items in the cart
const DEBUG_CART_STORE = process.env.NODE_ENV === 'development'; // Add debug flag
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development'; // Add analytics debug flag

// Ensure cart is loaded from localStorage at module initialization on the client-side
let cart: CartItemType[] = typeof window !== 'undefined' ? loadCart() : [];
const listeners = new Set<() => void>();

/**
 * Compares two carts for equality based on item IDs and quantities.
 * @param {CartItemType[]} cartA - The first cart.
 * @param {CartItemType[]} cartB - The second cart.
 * @returns {boolean} True if carts are equal, false otherwise.
 */
function areCartsEqual(cartA: CartItemType[], cartB: CartItemType[]): boolean {
  if (cartA.length !== cartB.length) {
    return false;
  }
  const cartBMap = new Map(cartB.map((item) => [item.id, item.quantity]));
  for (const itemA of cartA) {
    if (cartBMap.get(itemA.id) !== itemA.quantity) {
      return false;
    }
  }
  return true;
}

/**
 * Loads the cart from localStorage, sanitizing the data.
 * @returns {CartItemType[]} The loaded cart.
 */
function loadCart(): CartItemType[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  if (DEBUG_CART_STORE) console.time('cartStore:loadCart');
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  try {
    const parsed = storedCart ? (JSON.parse(storedCart) as unknown) : []; // Parse as unknown first
    if (Array.isArray(parsed)) {
      // Validate and sanitize item structure
      const validatedCart = parsed
        .filter(
          (item: unknown): item is Partial<CartItemType> & { id: string; productId: string; name: string } => // Type guard with unknown
            item != null && // Ensure item is not null or undefined
            typeof item === 'object' && // Ensure item is an object
            'id' in item && typeof (item as {id: unknown}).id === 'string' &&
            'productId' in item && typeof (item as {productId: unknown}).productId === 'string' &&
            'name' in item && typeof (item as {name: unknown}).name === 'string'
        )
        .map(
          (item): CartItemType => ({
            // Ensure all fields are correctly typed and defaulted
            id: String(item.id),
            productId: String(item.productId),
            name: String(item.name || 'Unknown Item'),
            variant: String(item.variant || ''),
            sku: String(item.sku || item.id), // Fallback sku to id if not present
            unitPrice: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 1,
            thumbnailUrl: String(item.thumbnailUrl || ''),
            href: String(item.href || '#'),
            stock: Number(item.stock) || 0,
          })
        );
      if (DEBUG_CART_STORE) console.timeEnd('cartStore:loadCart');
      return validatedCart; // Explicitly return the processed cart
    }
    localStorage.removeItem(CART_STORAGE_KEY); // Clear corrupted non-array data
    if (DEBUG_CART_STORE) console.timeEnd('cartStore:loadCart');
    return [];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY); // Clear corrupted JSON
    if (DEBUG_CART_STORE) console.timeEnd('cartStore:loadCart');
    return [];
  }
}

/**
 * Saves the cart to localStorage.
 * @param {CartItemType[]} newCart - The cart state to save.
 */
function saveCart(newCart: CartItemType[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  if (DEBUG_CART_STORE) console.time('cartStore:saveCart');
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.error(
        'LocalStorage quota exceeded. Cart cannot be saved. Consider notifying the user to clear space or reduce cart size.'
      );
      // In a real app, you might dispatch a global event here for the UI to pick up, e.g.,
      // window.dispatchEvent(new CustomEvent('cartError', { detail: { type: 'QuotaExceededError', message: 'Storage full' } }));
    }
  } finally {
    if (DEBUG_CART_STORE) console.timeEnd('cartStore:saveCart');
  }
}

/**
 * Notifies all subscribed listeners about a change in the cart state.
 */
function emitChange() {
  // Iterate over a copy of listeners to avoid issues if a listener modifies the set.
  [...listeners].forEach((listener) => listener());
}

/**
 * The core cart store object.
 */
export const cartStore = {
  /**
   * Gets a snapshot of the current cart state.
   * @returns {CartItemType[]} The current cart items.
   */
  getSnapshot: (): CartItemType[] => cart,

  /**
   * Subscribes a listener function to cart changes.
   * @param {() => void} listener - The function to call when the cart changes.
   * @returns {() => void} An unsubscribe function.
   */
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Adds an item to the cart or updates its quantity if it already exists.
   * Enforces maximum cart item limit for new distinct items.
   * @param {Omit<CartItemType, 'quantity'>} newItemData - The details of the item to add.
   * @param {number} quantityToAdd - The quantity to add.
   */
  addItem: (newItemData: Omit<CartItemType, 'quantity'>, quantityToAdd: number): void => {
    if (quantityToAdd <= 0) return;

    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex((item) => item.id === newItemData.id);

    if (existingItemIndex > -1) {
      const existingItem = newCart[existingItemIndex];
      const updatedQuantity = Math.min(existingItem.quantity + quantityToAdd, existingItem.stock);
      newCart[existingItemIndex] = { ...existingItem, quantity: updatedQuantity };
    } else {
      if (newCart.length >= MAX_CART_ITEMS) {
        console.warn(
          `Cart is full. Max ${MAX_CART_ITEMS} distinct items allowed. Cannot add ${newItemData.name}.`
        );
        // Optionally dispatch an event here for UI to notify user
        return;
      }
      const quantity = Math.min(quantityToAdd, newItemData.stock);
      if (quantity > 0) {
        newCart.push({ ...newItemData, quantity });
      }
    }
    cart = newCart;
    saveCart(cart);
    emitChange();
    if (DEBUG_ANALYTICS) {
      const eventData = {
        item_id: newItemData.sku,
        item_name: newItemData.name,
        item_variant: newItemData.variant,
        quantity: existingItemIndex > -1 ? newCart[existingItemIndex].quantity : quantityToAdd, // Log the actual quantity set or added
        price: newItemData.unitPrice / 100, // Example: log price in dollars
      };
      console.log('[Analytics] Event: addToCart, Data:', eventData);
    }
  },

  /**
   * Removes an item from the cart.
   * @param {string} itemId - The ID of the item to remove.
   */
  removeItem: (itemId: string): void => {
    const originalCartLength = cart.length;
    const newCart = cart.filter((item) => item.id !== itemId);
    if (newCart.length !== originalCartLength) {
      cart = newCart;
      saveCart(cart);
      emitChange();
      if (DEBUG_ANALYTICS) {
        console.log(`[Analytics] Event: removeFromCart, Item ID: ${itemId}`);
      }
    }
  },

  /**
   * Updates the quantity of an item in the cart.
   * If newQuantity is 0 or less, the item is removed.
   * @param {string} itemId - The ID of the item to update.
   * @param {number} newQuantity - The new quantity for the item.
   */
  updateItemQuantity: (itemId: string, newQuantity: number): void => {
    const itemIndex = cart.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    let newCart = [...cart];
    let itemChangedOrRemoved = false;

    if (newQuantity <= 0) {
      newCart = newCart.filter((item) => item.id !== itemId);
      itemChangedOrRemoved = newCart.length !== cart.length;
    } else {
      const itemToUpdate = newCart[itemIndex];
      const validatedQuantity = Math.min(newQuantity, itemToUpdate.stock);
      const finalQuantity = Math.max(1, validatedQuantity); // Ensure quantity is at least 1

      if (itemToUpdate.quantity !== finalQuantity) {
        newCart[itemIndex] = { ...itemToUpdate, quantity: finalQuantity };
        itemChangedOrRemoved = true;
      }
    }

    if (itemChangedOrRemoved) {
      cart = newCart;
      saveCart(cart);
      emitChange();
      if (DEBUG_ANALYTICS) {
        const updatedItem = newCart.find(item => item.id === itemId);
        const eventData = {
          item_id: itemId,
          new_quantity: updatedItem ? updatedItem.quantity : 0, // 0 if removed
          action: newQuantity <= 0 ? 'removed_by_quantity_update' : 'quantity_updated',
        };
        console.log('[Analytics] Event: updateCartQuantity, Data:', eventData);
      }
    }
  },

  /**
   * Clears all items from the cart.
   */
  clearCart: (): void => {
    if (cart.length > 0) {
      cart = [];
      saveCart(cart);
      emitChange();
      if (DEBUG_ANALYTICS) {
        console.log('[Analytics] Event: clearCart');
      }
    }
  },

  /**
   * Replaces the entire cart with a new set of items.
   * @param {CartItemType[]} newCartState - The new cart state.
   */
  setCart: (newCartState: CartItemType[]): void => {
    // Basic validation for the new cart state
    if (!Array.isArray(newCartState)) {
      console.error('setCart received non-array data. Aborting update.');
      return;
    }
    const sanitizedCart = newCartState
      .filter(
        (item: unknown): item is Partial<CartItemType> & { id: string; productId: string; name: string } => // Type guard with unknown
          item != null && // Ensure item is not null or undefined
          typeof item === 'object' && // Ensure item is an object
          'id' in item && typeof (item as {id: unknown}).id === 'string' &&
          'productId' in item && typeof (item as {productId: unknown}).productId === 'string' &&
          'name' in item && typeof (item as {name: unknown}).name === 'string'
      )
      .map(
        (item): CartItemType => ({
          id: String(item.id),
          productId: String(item.productId),
          name: String(item.name || 'Unknown Item'),
          variant: String(item.variant || ''),
          sku: String(item.sku || item.id),
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Number(item.quantity) || 1,
          thumbnailUrl: String(item.thumbnailUrl || ''),
          href: String(item.href || '#'),
          stock: Number(item.stock) || 0,
        })
      );

    if (!areCartsEqual(cart, sanitizedCart)) {
      cart = sanitizedCart;
      saveCart(cart);
      emitChange();
    }
  },

  /**
   * Retrieves a specific item from the cart by its ID.
   * @param {string} itemId - The ID of the item to retrieve.
   * @returns {CartItemType | undefined} The cart item if found, otherwise undefined.
   */
  getItem: (itemId: string): CartItemType | undefined => {
    return cart.find((item) => item.id === itemId);
  },

  /**
   * Checks if an item is already in the cart.
   * @param {string} itemId - The ID of the item to check.
   * @returns {boolean} True if the item is in the cart, false otherwise.
   */
  isInCart: (itemId: string): boolean => {
    return cart.some((item) => item.id === itemId);
  },
};

// Sync cart state across browser tabs
if (typeof window !== 'undefined' && window.localStorage) {
  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
      const newCartFromStorage = loadCart();
      // Only update and emit if the cart has actually changed.
      if (!areCartsEqual(cart, newCartFromStorage)) {
        cart = newCartFromStorage;
        emitChange();
      }
    }
  });
}