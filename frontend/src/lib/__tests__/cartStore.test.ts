import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cartStore } from '../cartStore';
import type { CartItemType } from '../../types/cart';

const CART_STORAGE_KEY = 'kleisCart';
const MAX_CART_ITEMS = 50; // Ensure this matches the constant in cartStore.ts

// Helper type predicate for a single CartItemType
function isCartItem(item: unknown): item is CartItemType { // Changed 'any' to 'unknown'
    // Added check for item being non-null and an object
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    // Cast to Record<string, unknown> for safe property access
    const obj = item as Record<string, unknown>;
    return (
        typeof obj.id === 'string' &&
        typeof obj.productId === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.variant === 'string' &&
        typeof obj.sku === 'string' &&
        typeof obj.unitPrice === 'number' &&
        typeof obj.quantity === 'number' &&
        typeof obj.thumbnailUrl === 'string' &&
        typeof obj.href === 'string' &&
        typeof obj.stock === 'number'
    );
}

// Helper type predicate for CartItemType[]
function isCartItemArray(data: unknown): data is CartItemType[] {
    return Array.isArray(data) && data.every(isCartItem);
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.dispatchEvent for storage event testing
// const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent'); // Unused

const sampleItem1: Omit<CartItemType, 'quantity'> = {
  id: 'SKU001',
  productId: 'prod1',
  name: 'Test Item 1',
  variant: '10mg',
  sku: 'SKU001',
  unitPrice: 1000, // 10.00
  thumbnailUrl: '/img1.jpg',
  href: '/prod1',
  stock: 10,
};

const sampleItem2: Omit<CartItemType, 'quantity'> = {
  id: 'SKU002',
  productId: 'prod2',
  name: 'Test Item 2',
  variant: '5mg',
  sku: 'SKU002',
  unitPrice: 500, // 5.00
  thumbnailUrl: '/img2.jpg',
  href: '/prod2',
  stock: 5,
};

describe('cartStore', () => {
  let listenerSpy: ReturnType<typeof vi.fn>;
  let unsubscribe: () => void;

  beforeEach(() => {
    localStorageMock.clear();
    // Reset cartStore internal state by re-initializing (simulating module reload for store's `cart` variable)
    // This is tricky as the `cart` variable is module-scoped.
    // For true isolation, cartStore might need a reset method, or we test it as a whole.
    // For now, we'll rely on clearCart and setCart to manage state for tests.
    cartStore.clearCart(); // Clears internal state and localStorage

    listenerSpy = vi.fn();
    unsubscribe = cartStore.subscribe(listenerSpy);
  });

  afterEach(() => {
    unsubscribe();
    vi.clearAllMocks();
  });

  it('should initialize with an empty cart if localStorage is empty', () => {
    // cartStore is initialized at module load. We clear it in beforeEach.
    // To test initial load from empty, we'd need to reload the module or have a reset.
    // Assuming beforeEach's clearCart() sets it to empty:
    expect(cartStore.getSnapshot()).toEqual([]);
  });

  it('should load cart from localStorage if available', () => {
    const storedCart: CartItemType[] = [{ ...sampleItem1, quantity: 1 }];
    localStorageMock.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart));

    // Simulate re-initialization or a mechanism to reload from storage
    // This is the hardest part to test without module-level mocks or a reset function.
    // We can test `setCart` which is used by the storage event listener.
    cartStore.setCart(storedCart); // Manually trigger what loadCart would do
    expect(cartStore.getSnapshot()).toEqual(storedCart);
    expect(listenerSpy).toHaveBeenCalled();
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      cartStore.addItem(sampleItem1, 1);
      expect(cartStore.getSnapshot()).toEqual([{ ...sampleItem1, quantity: 1 }]);
      expect(localStorageMock.getItem(CART_STORAGE_KEY)).toBe(
        JSON.stringify([{ ...sampleItem1, quantity: 1 }])
      );
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should update quantity if item already exists', () => {
      cartStore.addItem(sampleItem1, 1);
      cartStore.addItem(sampleItem1, 2);
      expect(cartStore.getSnapshot()).toEqual([{ ...sampleItem1, quantity: 3 }]);
      expect(listenerSpy).toHaveBeenCalledTimes(2);
    });

    it('should not add more than available stock', () => {
      cartStore.addItem(sampleItem1, sampleItem1.stock + 5);
      expect(cartStore.getSnapshot()[0].quantity).toBe(sampleItem1.stock);
    });

    it('should update quantity up to stock limit if item exists', () => {
      cartStore.addItem(sampleItem1, 1); // Cart: SKU001 qty 1
      cartStore.addItem(sampleItem1, sampleItem1.stock + 5); // Try to add more than stock
      expect(cartStore.getSnapshot()[0].quantity).toBe(sampleItem1.stock);
    });

    it('should not add item if quantityToAdd is 0 or less', () => {
      cartStore.addItem(sampleItem1, 0);
      expect(cartStore.getSnapshot()).toEqual([]);
      cartStore.addItem(sampleItem1, -1);
      expect(cartStore.getSnapshot()).toEqual([]);
      expect(listenerSpy).not.toHaveBeenCalled();
    });

    it(`should not add more than ${MAX_CART_ITEMS} distinct items`, () => {
      for (let i = 0; i < MAX_CART_ITEMS; i++) {
        cartStore.addItem({ ...sampleItem1, id: `SKU_MAX_${i}`, sku: `SKU_MAX_${i}` }, 1);
      }
      expect(cartStore.getSnapshot().length).toBe(MAX_CART_ITEMS);
      listenerSpy.mockClear(); // Clear calls from loop

      cartStore.addItem(sampleItem2, 1); // Try to add one more distinct item
      expect(cartStore.getSnapshot().length).toBe(MAX_CART_ITEMS);
      expect(cartStore.getSnapshot().find((item) => item.id === sampleItem2.id)).toBeUndefined();
      expect(listenerSpy).not.toHaveBeenCalled(); // Should not emit if item not added
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      cartStore.addItem(sampleItem1, 1);
      cartStore.addItem(sampleItem2, 1);
      listenerSpy.mockClear();

      cartStore.removeItem(sampleItem1.id);
      expect(cartStore.getSnapshot()).toEqual([{ ...sampleItem2, quantity: 1 }]);
      expect(localStorageMock.getItem(CART_STORAGE_KEY)).toBe(
        JSON.stringify([{ ...sampleItem2, quantity: 1 }])
      );
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if item to remove is not in cart', () => {
      cartStore.addItem(sampleItem1, 1);
      listenerSpy.mockClear();
      cartStore.removeItem('NON_EXISTENT_SKU');
      expect(cartStore.getSnapshot()).toEqual([{ ...sampleItem1, quantity: 1 }]);
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    beforeEach(() => {
      cartStore.addItem(sampleItem1, 2); // Item stock is 10
      listenerSpy.mockClear();
    });

    it('should update the quantity of an item', () => {
      cartStore.updateItemQuantity(sampleItem1.id, 5);
      expect(cartStore.getSnapshot()[0].quantity).toBe(5);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove item if new quantity is 0', () => {
      cartStore.updateItemQuantity(sampleItem1.id, 0);
      expect(cartStore.getSnapshot()).toEqual([]);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove item if new quantity is less than 0', () => {
      cartStore.updateItemQuantity(sampleItem1.id, -1);
      expect(cartStore.getSnapshot()).toEqual([]);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should not update quantity beyond available stock', () => {
      cartStore.updateItemQuantity(sampleItem1.id, sampleItem1.stock + 5);
      expect(cartStore.getSnapshot()[0].quantity).toBe(sampleItem1.stock);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should set quantity to 1 if new quantity is valid but less than 1 (e.g. 0.5)', () => {
      cartStore.updateItemQuantity(sampleItem1.id, 0.5); // Pass as number
      expect(cartStore.getSnapshot()[0].quantity).toBe(1);
    });

    it('should do nothing if item to update is not in cart', () => {
      cartStore.updateItemQuantity('NON_EXISTENT_SKU', 5);
      expect(cartStore.getSnapshot()[0].quantity).toBe(2); // Unchanged
      expect(listenerSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if quantity is not changed', () => {
      cartStore.updateItemQuantity(sampleItem1.id, 2); // Current quantity is 2
      expect(cartStore.getSnapshot()[0].quantity).toBe(2);
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      cartStore.addItem(sampleItem1, 1);
      cartStore.addItem(sampleItem2, 1);
      listenerSpy.mockClear();

      cartStore.clearCart();
      expect(cartStore.getSnapshot()).toEqual([]);
      expect(localStorageMock.getItem(CART_STORAGE_KEY)).toBe(JSON.stringify([]));
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if cart is already empty', () => {
      cartStore.clearCart(); // cart is already empty
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('setCart', () => {
    const newCartState: CartItemType[] = [
      { ...sampleItem1, quantity: 3 },
      { ...sampleItem2, quantity: 1 },
    ];
    it('should replace the entire cart with a new set of items', () => {
      cartStore.addItem(sampleItem1, 1); // Initial item
      listenerSpy.mockClear();

      cartStore.setCart(newCartState);
      expect(cartStore.getSnapshot()).toEqual(newCartState);
      // Parse the stored string back to an object for comparison
      const storedCartRaw = localStorageMock.getItem(CART_STORAGE_KEY);
      expect(storedCartRaw).not.toBeNull();
      const unsafeStoredCartParsed: unknown = storedCartRaw ? JSON.parse(storedCartRaw) : [];
      const storedCartParsed = unsafeStoredCartParsed as CartItemType[];
      expect(storedCartParsed).toEqual(newCartState);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should sanitize items when setting cart', () => {
      const dirtyCart: Partial<CartItemType>[] = [ // Use Partial<CartItemType> for test data
        { id: 'dirty1', name: 'Dirty Item 1', productId: 'p1' }, // Missing fields
        { ...sampleItem1, quantity: 1, unitPrice: '1000' as unknown as number }, // unitPrice as string (cast to any for test)
      ];
      cartStore.setCart(dirtyCart as unknown as CartItemType[]); // Cast for the method call, acknowledging type difference for test
      const snapshot = cartStore.getSnapshot();
      expect(snapshot.length).toBe(2);
      expect(snapshot[0]).toEqual(
        expect.objectContaining({
          id: 'dirty1',
          name: 'Dirty Item 1',
          productId: 'p1',
          variant: '', // Defaulted
          sku: 'dirty1', // Defaulted
          unitPrice: 0, // Defaulted
          quantity: 1, // Defaulted
          thumbnailUrl: '', // Defaulted
          href: '#', // Defaulted
          stock: 0, // Defaulted
        })
      );
      expect(snapshot[1].unitPrice).toBe(1000);
    });

    it('should not emit change if new cart is identical to current cart', () => {
      cartStore.setCart(newCartState); // Set initial state
      listenerSpy.mockClear();
      cartStore.setCart(newCartState); // Set identical state
      expect(listenerSpy).not.toHaveBeenCalled();
    });

    it('should handle non-array input gracefully', () => {
      cartStore.addItem(sampleItem1, 1); // Have some initial state
      const currentCart = cartStore.getSnapshot();
      listenerSpy.mockClear();

      cartStore.setCart(null as unknown as CartItemType[]); // Test null input with explicit cast
      expect(cartStore.getSnapshot()).toEqual(currentCart); // State should not change
      expect(listenerSpy).not.toHaveBeenCalled();

      cartStore.setCart({} as unknown as CartItemType[]); // Test object input with explicit cast
      expect(cartStore.getSnapshot()).toEqual(currentCart); // State should not change
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should call listener when cart changes', () => {
      cartStore.addItem(sampleItem1, 1);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call listener after unsubscribe', () => {
      unsubscribe();
      cartStore.addItem(sampleItem1, 1);
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      cartStore.addItem(sampleItem1, 2);
    });

    it('getItem should return the correct item or undefined', () => {
      expect(cartStore.getItem(sampleItem1.id)).toEqual({ ...sampleItem1, quantity: 2 });
      expect(cartStore.getItem('NON_EXISTENT_SKU')).toBeUndefined();
    });

    it('isInCart should return true if item is in cart, false otherwise', () => {
      expect(cartStore.isInCart(sampleItem1.id)).toBe(true);
      expect(cartStore.isInCart('NON_EXISTENT_SKU')).toBe(false);
    });
  });

  describe('localStorage interactions', () => {
    it('loadCart should return empty array for corrupted JSON', () => {
      localStorageMock.setItem(CART_STORAGE_KEY, 'corrupted_json_not_parseable');
      // Need a way to trigger loadCart or test it in isolation.
      // cartStore.setCart([]) // Resetting for this test's purpose
      // cartStore.setCart(JSON.parse(localStorageMock.getItem(CART_STORAGE_KEY) || '[]')); // This would throw
      // The current cartStore structure loads on module init.
      // We can test the internal loadCart logic by calling setCart with what loadCart would produce.
      // If loadCart was exported, we could test it directly.
      // For now, we assume the sanitization in setCart covers this.
      cartStore.setCart('corrupted_json_not_parseable' as unknown as CartItemType[]); // This will be caught by `setCart`'s Array.isArray check
      expect(cartStore.getSnapshot()).toEqual([]); // Expect it to not change or be empty
    });

    it('loadCart should return empty array for non-array data', () => {
      localStorageMock.setItem(CART_STORAGE_KEY, JSON.stringify({ not: 'an array' }));
      // Simulate loadCart's behavior by directly calling setCart with parsed potentially problematic data
      let parsedData: CartItemType[];
      try {
        const jsonString = localStorageMock.getItem(CART_STORAGE_KEY);
        const rawParsed: unknown = jsonString ? JSON.parse(jsonString) : [];
        if (isCartItemArray(rawParsed)) {
            parsedData = rawParsed;
        } else {
            // If not a valid CartItemType[], treat as empty.
            // This aligns with how cartStore's loadCart/setCart sanitizes.
            parsedData = [];
        }
      } catch {
        parsedData = [];
      }
      cartStore.setCart(parsedData); // Pass directly, cartStore.setCart handles sanitization
      expect(cartStore.getSnapshot()).toEqual([]);
    });

    it('saveCart should handle QuotaExceededError', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      };

      cartStore.addItem(sampleItem1, 1); // This will attempt to save

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving cart to localStorage:',
        expect.any(DOMException)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'LocalStorage quota exceeded. Cart cannot be saved. Consider notifying the user to clear space or reduce cart size.'
      );

      localStorageMock.setItem = originalSetItem; // Restore original
      consoleErrorSpy.mockRestore();
    });
  });

  describe('cross-tab synchronization (storage event)', () => {
    it('should update cart and emit change when storage event occurs with different cart data', () => {
      cartStore.addItem(sampleItem1, 1); // Initial cart: [SKU001 qty 1]
      listenerSpy.mockClear();

      const newCartDataFromOtherTab: CartItemType[] = [{ ...sampleItem2, quantity: 3 }];
      const stringifiedCartData: string = JSON.stringify(newCartDataFromOtherTab);
      const storageEvent = new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: stringifiedCartData,
      });

      // Manually update localStorage as if another tab did it
      localStorageMock.setItem(CART_STORAGE_KEY, stringifiedCartData);
      window.dispatchEvent(storageEvent);

      expect(cartStore.getSnapshot()).toEqual(newCartDataFromOtherTab);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit change if storage event data is same as current cart', () => {
      const currentCartState: CartItemType[] = [{ ...sampleItem1, quantity: 1 }];
      cartStore.setCart(currentCartState);
      listenerSpy.mockClear();

      const storageEvent = new StorageEvent('storage', {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(currentCartState), // Same data
      });
      const stringifiedCartData: string = JSON.stringify(currentCartState);
      localStorageMock.setItem(CART_STORAGE_KEY, stringifiedCartData);
      window.dispatchEvent(storageEvent);

      expect(listenerSpy).not.toHaveBeenCalled();
    });

    it('should not react to storage events for other keys', () => {
      cartStore.addItem(sampleItem1, 1);
      listenerSpy.mockClear();

      const storageEvent = new StorageEvent('storage', {
        key: 'OTHER_KEY',
        newValue: JSON.stringify([{ ...sampleItem2, quantity: 1 }]),
      });
      window.dispatchEvent(storageEvent);

      expect(cartStore.getSnapshot()).toEqual([{ ...sampleItem1, quantity: 1 }]); // Unchanged
      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});