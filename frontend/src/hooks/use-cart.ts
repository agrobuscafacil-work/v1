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
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
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
            return { items: [...state.items, { product, quantity }] };
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
        }));
        toast.success('Item removido do carrinho');
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
        set({ items: [] });
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'agro-cart',
      storage: createJSONStorage(() => dynamicStorage),
    }
  )
);