import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCartStore());
    expect(result.current.items).toEqual([]);
    expect(result.current.getTotal()).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      menuItemId: '1',
      name: 'Burger',
      price: 10.50,
      qty: 1,
    });
  });

  it('updates quantity of existing item', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].qty).toBe(2);
  });

  it('updates item quantity directly', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
      result.current.updateQty('1', 5);
    });

    expect(result.current.items[0].qty).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
      result.current.updateQty('1', 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('updates item notes', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
      result.current.updateNotes('1', 'No onions');
    });

    expect(result.current.items[0].notes).toBe('No onions');
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({
        menuItemId: '1',
        name: 'Burger',
        price: 10.50,
      });
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({ menuItemId: '1', name: 'Burger', price: 10.50 }, 2);
      result.current.addItem({ menuItemId: '2', name: 'Fries', price: 5.00 }, 1);
    });

    expect(result.current.getTotal()).toBe(26.00);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem({ menuItemId: '1', name: 'Burger', price: 10.50 });
      result.current.addItem({ menuItemId: '2', name: 'Fries', price: 5.00 });
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getTotal()).toBe(0);
  });
});
