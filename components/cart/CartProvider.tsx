"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_COLUMNS, toProduct, type Product } from "@/lib/product-types";

// Cart and wishlist live in the browser only (localStorage), keyed by product slug.
// Product details are looked up in the database, so a resource that is unpublished or deleted
// simply drops out. The whole cart is paid in one Razorpay order (see /api/checkout).

const CART_KEY = "ts-cart";
const WISH_KEY = "ts-wish";

type CartContextValue = {
  cart: string[];
  wished: string[];
  cartItems: Product[];
  wishedItems: Product[];
  cartOpen: boolean;
  toggleCart: (slug: string) => void;
  toggleWish: (slug: string) => void;
  removeFromCart: (slugs: string[]) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue>({
  cart: [],
  wished: [],
  cartItems: [],
  wishedItems: [],
  cartOpen: false,
  toggleCart: () => {},
  toggleWish: () => {},
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
  const [wished, setWished] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<Record<string, Product>>({});

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

  // Look up the saved products. Anything no longer published is removed from cart and wishlist.
  const slugKey = Array.from(new Set([...cart, ...wished])).sort().join(",");
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
          const gone = new Set(slugs.filter((s) => !found.some((p) => p.slug === s)));
          if (gone.size) {
            setCart((items) => items.filter((s) => !gone.has(s)));
            setWished((items) => items.filter((s) => !gone.has(s)));
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
  const wishedItems = useMemo(() => wished.map((s) => catalog[s]).filter(Boolean), [wished, catalog]);

  const toggleCart = useCallback((slug: string) => setCart((items) => toggle(items, slug)), []);
  const toggleWish = useCallback((slug: string) => setWished((items) => toggle(items, slug)), []);
  const removeFromCart = useCallback(
    (slugs: string[]) => setCart((items) => items.filter((s) => !slugs.includes(s))),
    [],
  );
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ cart, wished, cartItems, wishedItems, cartOpen, toggleCart, toggleWish, removeFromCart, openCart, closeCart }),
    [cart, wished, cartItems, wishedItems, cartOpen, toggleCart, toggleWish, removeFromCart, openCart, closeCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
