"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products } from "@/lib/sample-data";

// Cart and wishlist live in the browser only (localStorage), keyed by product slug.
// Payment still happens one product at a time through the existing Buy now flow.

const CART_KEY = "ts-cart";
const WISH_KEY = "ts-wish";

type CartContextValue = {
  cart: string[];
  wished: string[];
  cartOpen: boolean;
  toggleCart: (slug: string) => void;
  toggleWish: (slug: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue>({
  cart: [],
  wished: [],
  cartOpen: false,
  toggleCart: () => {},
  toggleWish: () => {},
  openCart: () => {},
  closeCart: () => {},
});

const known = new Set(products.map((p) => p.slug));

function read(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && known.has(v)) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode); the cart then simply lasts for this visit.
  }
}

const toggle = (items: string[], item: string) =>
  items.includes(item) ? items.filter((v) => v !== item) : [...items, item];

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<string[]>([]);
  const [wished, setWished] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read saved items after the first render so server and browser HTML match.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(read(CART_KEY));
    setWished(read(WISH_KEY));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(CART_KEY, cart);
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) write(WISH_KEY, wished);
  }, [wished, hydrated]);

  const toggleCart = useCallback((slug: string) => setCart((items) => toggle(items, slug)), []);
  const toggleWish = useCallback((slug: string) => setWished((items) => toggle(items, slug)), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ cart, wished, cartOpen, toggleCart, toggleWish, openCart, closeCart }),
    [cart, wished, cartOpen, toggleCart, toggleWish, openCart, closeCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
