import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';
import { cartStore } from '../../lib/cartStore';
import type { CartItemType } from '../../types/cart';

// Mock the cartStore
vi.mock('../../lib/cartStore', () => ({
  cartStore: {
    getSnapshot: vi.fn(),
    subscribe: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    clearCart: vi.fn(),
    setCart: vi.fn(),
    getItem: vi.fn(), // Not directly used by useCart but good to have if store changes
    isInCart: vi.fn(), // Not directly used by useCart
  },
}));

const sampleItem1: CartItemType = {
  id: 'SKU001',
  productId: 'prod1',
  name: 'Test Item 1',
  variant: '10mg',
  sku: 'SKU001',
  unitPrice: 1000,
  quantity: 1,
  thumbnailUrl: '/img1.jpg',
  href: '/prod1',
  stock: 10,
};

const sampleItem2: CartItemType = {
  id: 'SKU002',
  productId: 'prod2',
  name: 'Test Item 2',
  variant: '5mg',
  sku: 'SKU002',
  unitPrice: 500,
  quantity: 2,
  thumbnailUrl: '/img2.jpg',
  href: '/prod2',
  stock: 5,
};

describe('useCart hook', () => {
  let mockSnapshot: CartItemType[] = [];
  let mockSubscribeCallback: (() => void) | null = null;

  beforeEach(() => {
    (cartStore.getSnapshot as ReturnType<typeof vi.fn>).mockImplementation(() => mockSnapshot);
    (cartStore.subscribe as ReturnType<typeof vi.fn>).mockImplementation((listener) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mockSubscribeCallback = listener;
      return () => {
        // Unsubscribe function
        mockSubscribeCallback = null;
      };
    });
    // Reset all method mocks
    (cartStore.addItem as ReturnType<typeof vi.fn>).mockClear();
    (cartStore.removeItem as ReturnType<typeof vi.fn>).mockClear();
    (cartStore.updateItemQuantity as ReturnType<typeof vi.fn>).mockClear();
    (cartStore.clearCart as ReturnType<typeof vi.fn>).mockClear();
    (cartStore.setCart as ReturnType<typeof vi.fn>).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockSubscribeCallback = null;
  });

  const updateSnapshot = (newSnapshot: CartItemType[]) => {
    mockSnapshot = newSnapshot;
    if (mockSubscribeCallback) {
      act(() => {
        mockSubscribeCallback!();
      });
    }
  };

  it('should return initial cart state (empty)', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should return cart items from store snapshot', () => {
    updateSnapshot([sampleItem1, sampleItem2]);
    const { result } = renderHook(() => useCart());

    expect(result.current.items).toEqual([sampleItem1, sampleItem2]);
    expect(result.current.itemCount).toBe(3); // 1 + 2
    expect(result.current.totalPrice).toBe(2000); // 1*1000 + 2*500
  });

  it('should call cartStore.addItem when addToCart is called', () => {
    const { result } = renderHook(() => useCart());
    const itemDetails = { ...sampleItem1, quantity: undefined };
    const quantityToAdd = 1;

    act(() => {
      result.current.addToCart(itemDetails, quantityToAdd);
    });

    expect(cartStore.addItem).toHaveBeenCalledWith(itemDetails, quantityToAdd);
  });

  it('should call cartStore.removeItem when removeFromCart is called', () => {
    const { result } = renderHook(() => useCart());
    const itemId = 'SKU001';

    act(() => {
      result.current.removeFromCart(itemId);
    });

    expect(cartStore.removeItem).toHaveBeenCalledWith(itemId);
  });

  it('should call cartStore.updateItemQuantity when updateItemQuantity is called', () => {
    const { result } = renderHook(() => useCart());
    const itemId = 'SKU001';
    const newQuantity = 5;

    act(() => {
      result.current.updateItemQuantity(itemId, newQuantity);
    });

    expect(cartStore.updateItemQuantity).toHaveBeenCalledWith(itemId, newQuantity);
  });

  it('should call cartStore.clearCart when clearCart is called', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.clearCart();
    });

    expect(cartStore.clearCart).toHaveBeenCalled();
  });

  it('should call cartStore.setCart when setCart is called', () => {
    const { result } = renderHook(() => useCart());
    const newCart: CartItemType[] = [sampleItem1];

    act(() => {
      result.current.setCart(newCart);
    });

    expect(cartStore.setCart).toHaveBeenCalledWith(newCart);
  });

  it('should update items, itemCount, and totalPrice when store snapshot changes', () => {
    const { result, rerender } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);

    updateSnapshot([sampleItem1]);
    rerender(); // Rerender to reflect the updated snapshot from useSyncExternalStore

    expect(result.current.items).toEqual([sampleItem1]);
    expect(result.current.itemCount).toBe(sampleItem1.quantity);
    expect(result.current.totalPrice).toBe(sampleItem1.unitPrice * sampleItem1.quantity);

    updateSnapshot([sampleItem1, sampleItem2]);
    rerender();

    expect(result.current.items).toEqual([sampleItem1, sampleItem2]);
    expect(result.current.itemCount).toBe(sampleItem1.quantity + sampleItem2.quantity);
    expect(result.current.totalPrice).toBe(
      sampleItem1.unitPrice * sampleItem1.quantity + sampleItem2.unitPrice * sampleItem2.quantity
    );
  });

  describe('helper functions', () => {
    it('getItemById should return the correct item or undefined', () => {
      updateSnapshot([sampleItem1, sampleItem2]);
      const { result } = renderHook(() => useCart());

      expect(result.current.getItemById('SKU001')).toEqual(sampleItem1);
      expect(result.current.getItemById('SKU002')).toEqual(sampleItem2);
      expect(result.current.getItemById('NON_EXISTENT_SKU')).toBeUndefined();
    });

    it('isItemInCart should return true if item is in cart, false otherwise', () => {
      updateSnapshot([sampleItem1]);
      const { result } = renderHook(() => useCart());

      expect(result.current.isItemInCart('SKU001')).toBe(true);
      expect(result.current.isItemInCart('SKU002')).toBe(false);
    });
  });

  it('should provide a stable server snapshot (empty array)', () => {
    // The third argument to useSyncExternalStore is getServerSnapshot
    // We can't directly test it here, but we ensure the hook initializes empty
    // if the store's getSnapshot initially returns empty.
    (cartStore.getSnapshot as ReturnType<typeof vi.fn>).mockReturnValueOnce([]);
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
  });
});