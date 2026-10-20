"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_COLUMNS, toProduct, type Product } from "@/lib/product-types";

// The cart lives in the browser only (localStorage), keyed by product slug.
// Product details are looked up in the database, so a resource that is unpublished or deleted
// simply drops out. The whole cart is paid in one Razorpay order (see /api/checkout).

const CART_KEY = "ts-cart";
const OLD_WISH_KEY = "ts-wish"; // the wishlist was removed; clear what it left behind

type CartContextValue = {
  cart: string[];
  cartItems: Product[];
  cartOpen: boolean;
  toggleCart: (slug: string) => void;
  removeFromCart: (slugs: string[]) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue>({
  cart: [],
  cartItems: [],
  cartOpen: false,
  toggleCart: () => {},
  removeFromCart: () => {},
  openCart: () => {},
  closeCart: () => {},
});

function read(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
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
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<Record<string, Product>>({});

  // Read saved items after the first render so server and browser HTML match.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(read(CART_KEY));
    try {
      localStorage.removeItem(OLD_WISH_KEY);
    } catch {
      // Storage can be blocked; nothing to clear then.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(CART_KEY, cart);
  }, [cart, hydrated]);

  // Look up the saved products. Anything no longer published is removed from the cart.
  const slugKey = Array.from(new Set(cart)).sort().join(",");
  useEffect(() => {
    if (!hydrated || !slugKey) return;
    const slugs = slugKey.split(",");
    let cancelled = false;
    try {
      createClient()
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("published", true)
        .in("slug", slugs)
        .then(({ data, error }) => {
          if (cancelled || error || !data) return;
          const found = data.map(toProduct);
          setCatalog((prev) => ({ ...prev, ...Object.fromEntries(found.map((p) => [p.slug, p])) }));
          // Free resources do not go in the cart: they are added to the library from their page.
          const gone = new Set(slugs.filter((s) => !found.some((p) => p.slug === s && p.price > 0)));
          if (gone.size) {
            setCart((items) => items.filter((s) => !gone.has(s)));
          }
        });
    } catch {
      // Supabase keys not set: nothing to look up.
    }
    return () => {
      cancelled = true;
    };
  }, [hydrated, slugKey]);

  const cartItems = useMemo(() => cart.map((s) => catalog[s]).filter(Boolean), [cart, catalog]);

  const toggleCart = useCallback((slug: string) => setCart((items) => toggle(items, slug)), []);
  const removeFromCart = useCallback(
    (slugs: string[]) => setCart((items) => items.filter((s) => !slugs.includes(s))),
    [],
  );
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ cart, cartItems, cartOpen, toggleCart, removeFromCart, openCart, closeCart }),
    [cart, cartItems, cartOpen, toggleCart, removeFromCart, openCart, closeCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
