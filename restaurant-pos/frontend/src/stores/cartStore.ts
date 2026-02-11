import { create } from 'zustand';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  
  addItem: (item, qty = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.menuItemId === item.menuItemId
      );
      
      if (existingIndex >= 0) {
        // Update existing item quantity
        const newItems = [...state.items];
        newItems[existingIndex].qty += qty;
        return { items: newItems };
      }
      
      // Add new item
      return {
        items: [...state.items, { ...item, qty }],
      };
    });
  },
  
  updateQty: (menuItemId, qty) => {
    set((state) => {
      if (qty <= 0) {
        return {
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        };
      }
      
      return {
        items: state.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, qty } : i
        ),
      };
    });
  },
  
  updateNotes: (menuItemId, notes) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, notes } : i
      ),
    }));
  },
  
  removeItem: (menuItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItemId !== menuItemId),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },
}));
