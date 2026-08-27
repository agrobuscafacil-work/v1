'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from '@/lib/toast';
import { api } from '@/lib/api';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string;
  supplierName: string;
  supplierId?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  serverItemId?: string;
}

interface CartState {
  items: CartItem[];
  selectedProductIds: string[] | null;
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => void;
  removeItems: (productIds: string[]) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleItemSelection: (productId: string) => void;
  selectAllItems: () => void;
  clearItemSelection: () => void;
  getSelectedItems: () => CartItem[];
  totalItems: () => number;
  subtotal: () => number;
}

let cartOwner: string | null = null;

function storageKey(name: string) {
  return cartOwner ? `${name}:${cartOwner}` : `${name}:guest`;
}

const dynamicStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(storageKey(name));
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey(name), value);
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey(name));
    }
  },
};

export async function syncCartWithServer() {
  if (!cartOwner) return;
  try {
    const res = await api.get('/cart');
    const data = res.data.data ?? res.data;
    const serverItems: CartItem[] = (data.items ?? []).map((it: any) => ({
      product: {
        id: it.product.id,
        name: it.product.name,
        slug: it.product.slug ?? '',
        price: Number(it.product.price),
        unit: it.product.unit || 'un',
        image: it.product.images?.[0] || '',
        supplierName:
          it.product.supplier?.tradingName ||
          it.product.supplier?.companyName ||
          '',
        supplierId: it.product.supplierId,
      },
      quantity: it.quantity,
      serverItemId: it.id,
    }));

    const local = useCart.getState().items;
    const merged = [...serverItems];
    for (const li of local) {
      if (!merged.some((si) => si.product.id === li.product.id)) {
        merged.push(li);
      }
    }
    useCart.setState({ items: merged });
  } catch {
    // mantém o carrinho local se a API falhar
  }
}

export function setCartOwner(userId: string | null) {
  cartOwner = userId;
  if (typeof window === 'undefined') return;
  void useCart.persist.rehydrate();
  if (userId) void syncCartWithServer();
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedProductIds: null,

      addItem: async (product, quantity = 1) => {
        const localAdd = () => {
          set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
              toast.success('Quantidade atualizada no carrinho');
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              };
            }
            toast.success('Produto adicionado ao carrinho');
            return {
              items: [...state.items, { product, quantity }],
              selectedProductIds: state.selectedProductIds === null
                ? null
                : [...state.selectedProductIds, product.id],
            };
          });
        };

        if (!cartOwner) {
          localAdd();
          return;
        }

        try {
          const res = await api.post('/cart/items', {
            productId: product.id,
            quantity,
          });
          const item = res.data.data ?? res.data;
          set((state) => {
            const current = state.items.find((i) => i.product.id === product.id);
            if (current) {
              toast.success('Quantidade atualizada no carrinho');
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id
                    ? {
                        ...i,
                        quantity: i.quantity + quantity,
                        serverItemId: item.id ?? i.serverItemId,
                      }
                    : i
                ),
              };
            }
            toast.success('Produto adicionado ao carrinho');
            return {
              items: [
                ...state.items,
                { product, quantity, serverItemId: item.id },
              ],
              selectedProductIds: state.selectedProductIds === null
                ? null
                : [...state.selectedProductIds, product.id],
            };
          });
        } catch (error: any) {
          if (error?.response?.status && error.response.status < 500) {
            toast.error(
              error?.response?.data?.message ||
                'Não foi possível adicionar ao carrinho'
            );
            return;
          }
          localAdd();
        }
      },

      removeItem: (productId) => {
        const item = get().items.find((i) => i.product.id === productId);
        if (cartOwner && item?.serverItemId) {
          api.delete(`/cart/items/${item.serverItemId}`).catch(() => undefined);
        }
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
          selectedProductIds: state.selectedProductIds === null
            ? null
            : state.selectedProductIds.filter((id) => id !== productId),
        }));
        toast.success('Item removido do carrinho');
      },

      removeItems: (productIds) => {
        const productIdSet = new Set(productIds);
        const itemsToRemove = get().items.filter((item) => productIdSet.has(item.product.id));
        if (cartOwner) {
          itemsToRemove.forEach((item) => {
            if (item.serverItemId) {
              api.delete(`/cart/items/${item.serverItemId}`).catch(() => undefined);
            }
          });
        }
        set((state) => ({
          items: state.items.filter((item) => !productIdSet.has(item.product.id)),
          selectedProductIds: state.selectedProductIds === null
            ? null
            : state.selectedProductIds.filter((id) => !productIdSet.has(id)),
        }));
      },

      updateQuantity: (productId, delta) => {
        const current = get().items.find((i) => i.product.id === productId);
        if (!current) return;
        const newQty = Math.max(1, current.quantity + delta);
        if (cartOwner && current.serverItemId) {
          api
            .put(`/cart/items/${current.serverItemId}`, { quantity: newQty })
            .catch(() => undefined);
        }
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product.id === productId
                ? { ...i, quantity: newQty }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => {
        if (cartOwner) {
          api.delete('/cart').catch(() => undefined);
        }
        set({ items: [], selectedProductIds: null });
      },

      toggleItemSelection: (productId) => {
        set((state) => {
          const allIds = state.items.map((item) => item.product.id);
          const selectedIds = state.selectedProductIds === null ? allIds : state.selectedProductIds;
          const nextSelectedIds = selectedIds.includes(productId)
            ? selectedIds.filter((id) => id !== productId)
            : [...selectedIds, productId];
          return {
            selectedProductIds: nextSelectedIds.length === allIds.length ? null : nextSelectedIds,
          };
        });
      },

      selectAllItems: () => set({ selectedProductIds: null }),

      clearItemSelection: () => set({ selectedProductIds: [] }),

      getSelectedItems: () => {
        const { items, selectedProductIds } = get();
        if (selectedProductIds === null) return items;
        const selected = new Set(selectedProductIds);
        return items.filter((item) => selected.has(item.product.id));
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().getSelectedItems().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'agro-cart',
      storage: createJSONStorage(() => dynamicStorage),
    }
  )
);