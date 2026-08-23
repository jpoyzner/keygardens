"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Client-side cart persisted to localStorage. Phase 7 will sync this with
// server-side cart state and Stripe Checkout; this just backs the Phase 5
// add-to-cart action and a cart count indicator in the header.

const STORAGE_KEY = "keygardens:cart";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function calculateTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount — the initial render must
    // match the server (which has no localStorage), so this can't be a lazy
    // useState initializer without causing a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalQuantity: calculateTotalQuantity(items),
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((i) => i.productId === item.productId);
          if (existing) {
            return current.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
            );
          }
          return [...current, { ...item, quantity }];
        });
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((i) => i.productId !== productId));
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((i) => i.productId !== productId)
            : current.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        );
      },
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
