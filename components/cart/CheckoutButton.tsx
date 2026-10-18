"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { failedPaymentText, loadRazorpay } from "@/lib/razorpay-client";
import { trackBeginCheckout } from "@/lib/analytics";
import type { Product } from "@/lib/product-types";

type Note = { tone: "error" | "info"; text: string; libraryLink?: boolean };

/** Pays for everything in the cart with one Razorpay order. */
export default function CheckoutButton({ items }: { items: Product[] }) {
  const slugs = items.map((p) => p.slug);
  const total = items.reduce((sum, p) => sum + p.price, 0);
  const router = useRouter();
  const { user, ready, openSignIn } = useAuth();
  const { removeFromCart, closeCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  const slugKey = slugs.join(",");
  // Latest cart contents for analytics, without making the payment callback change on every render.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  async function startPayment() {
    if (!slugKey) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: slugKey.split(",") }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "login_required") openSignIn();
        else if (data.code === "confirming") setNote({ tone: "info", text: data.error, libraryLink: true });
        else if (data.code === "already_owned") {
          removeFromCart(data.owned ?? []);
          setNote({
            tone: "info",
            text: "Some items are already in your library, so we removed them from your cart. Check your total and try again.",
            libraryLink: true,
          });
        } else if (data.code === "items_changed") {
          removeFromCart(data.unavailable ?? []);
          setNote({ tone: "info", text: data.error });
        } else setNote({ tone: "error", text: data.error ?? "Could not start payment." });
        return;
      }
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        setNote({ tone: "error", text: "Could not load the payment window. Check your internet and try again." });
        return;
      }
      const paidSlugs = slugKey.split(",");
      trackBeginCheckout(itemsRef.current.filter((p) => paidSlugs.includes(p.slug)));
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "TopperShelf",
        description: data.name,
        order_id: data.orderId,
        prefill: { email: user?.email },
        theme: { color: "#0d9488" },
        modal: {
          ondismiss: () =>
            setNote({ tone: "info", text: "Payment window closed. No payment was made. You can try again any time." }),
        },
        handler: (response) => {
          removeFromCart(paidSlugs);
          closeCart();
          router.push(`/library?paid=1&order=${encodeURIComponent(response.razorpay_order_id ?? data.orderId)}`);
        },
      });
      rzp.on("payment.failed", (r) => setNote({ tone: "error", text: failedPaymentText(r) }));
      rzp.open();
    } catch {
      setNote({ tone: "error", text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  // After signing in, carry on with the checkout the student started. (Runs only when the sign-in state
  // changes, so it deliberately does not depend on startPayment.)
  useEffect(() => {
    if (ready && user && sessionStorage.getItem("pendingCheckout") === "1") {
      sessionStorage.removeItem("pendingCheckout");
      Promise.resolve().then(startPayment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  function onClick() {
    if (!user) {
      sessionStorage.setItem("pendingCheckout", "1");
      openSignIn();
      return;
    }
    startPayment();
  }

  const count = slugs.length;
  return (
    <div className="flex w-full flex-col gap-2">
      <Button onClick={onClick} disabled={busy || count === 0}>
        {busy ? "Please wait…" : `Checkout · ₹${total}`} <Icon name="cart" />
      </Button>
      {note && (
        <p className={`m-0 text-sm leading-snug ${note.tone === "error" ? "text-red-600" : "text-muted"}`} role="status">
          {note.text}{" "}
          {note.libraryLink && (
            <Link href="/library" className="font-semibold underline">
              Open My Library
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
