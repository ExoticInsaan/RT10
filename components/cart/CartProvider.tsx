"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_COLUMNS, toProduct, type Product } from "@/lib/product-types";

// The cart lives in the browser only (localStorage), keyed by product slug.
// Product details are looked up in the database, so a resource that is unpublished or deleted
// simply drops out. The whole cart is paid in one Razorpay order (see /api/checkout).

const CART_KEY = "ts-cart";
const OLD_WISH_KEY = "ts-wish"; // the wishlist was removed; clear what it left behind
const TIP_KEY = "ts-cart-tip-seen"; // set once the first-time "your cart is here" guide has been shown

type CartContextValue = {
  cart: string[];
  cartItems: Product[];
  cartOpen: boolean;
  /** True while the first-time guide pointing at the cart icon is showing. */
  cartTip: boolean;
  dismissCartTip: () => void;
  toggleCart: (slug: string) => void;
  removeFromCart: (slugs: string[]) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue>({
  cart: [],
  cartItems: [],
  cartOpen: false,
  cartTip: false,
  dismissCartTip: () => {},
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
  const [cartTip, setCartTip] = useState(false);
  const cartRef = useRef<string[]>([]);
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
    cartRef.current = cart;
    if (hydrated) write(CART_KEY, cart);
  }, [cart, hydrated]);

  // The guide hides itself after a while if the student ignores it.
  useEffect(() => {
    if (!cartTip) return;
    const t = setTimeout(() => setCartTip(false), 12000);
    return () => clearTimeout(t);
  }, [cartTip]);

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

  const toggleCart = useCallback((slug: string) => {
    // First time ever adding something: show the guide pointing at the cart icon (once per browser).
    if (!cartRef.current.includes(slug)) {
      try {
        if (!localStorage.getItem(TIP_KEY)) {
          localStorage.setItem(TIP_KEY, "1");
          setCartTip(true);
        }
      } catch {
        // Storage blocked: skip the guide rather than show it every time.
      }
    }
    setCart((items) => toggle(items, slug));
  }, []);
  const dismissCartTip = useCallback(() => setCartTip(false), []);
  const removeFromCart = useCallback(
    (slugs: string[]) => setCart((items) => items.filter((s) => !slugs.includes(s))),
    [],
  );
  const openCart = useCallback(() => {
    setCartTip(false);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ cart, cartItems, cartOpen, cartTip, dismissCartTip, toggleCart, removeFromCart, openCart, closeCart }),
    [cart, cartItems, cartOpen, cartTip, dismissCartTip, toggleCart, removeFromCart, openCart, closeCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
