import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  branchId: null,
  orderType: 'DINE_IN',
  tableNumber: null,
  deliveryAddress: '',
  notes: '',

  setBranchId: (branchId) => set({ branchId }),
  setOrderType: (orderType) => set({ orderType }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
  setNotes: (notes) => set({ notes }),

  addItem: (menuItem, quantity = 1, itemNotes = '') => {
    const items = get().items;
    const existing = items.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      set({
        items: items.map(i =>
          i.menuItemId === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      });
    } else {
      set({
        items: [...items, {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          imageUrl: menuItem.imageUrl,
          quantity,
          notes: itemNotes,
        }],
      });
    }
  },

  removeItem: (menuItemId) => {
    set({ items: get().items.filter(i => i.menuItemId !== menuItemId) });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set({
      items: get().items.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [], notes: '', deliveryAddress: '' }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

export default useCartStore;
