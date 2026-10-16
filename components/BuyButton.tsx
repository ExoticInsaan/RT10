"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

type RzpSuccess = { razorpay_order_id: string };
type RzpFailure = { error?: { description?: string } };
type RzpOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RzpSuccess) => void;
};
type RzpInstance = { open: () => void; on: (event: "payment.failed", cb: (r: RzpFailure) => void) => void };
type RzpCtor = new (o: RzpOptions) => RzpInstance;

function loadRazorpay(): Promise<RzpCtor | null> {
  const w = window as unknown as { Razorpay?: RzpCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(w.Razorpay ?? null);
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });
}

type Note = { tone: "error" | "info"; text: string; libraryLink?: boolean };

export default function BuyButton({ slug, price }: { slug: string; price: number }) {
  const router = useRouter();
  const { user, ready, openSignIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [owned, setOwned] = useState(false);

  // Does this student already own it? Then show "In your library" instead of a Buy button.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    createClient()
      .from("purchases")
      .select("id, products!inner(slug)")
      .eq("status", "paid")
      .eq("products.slug", slug)
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) setOwned(Boolean(data?.length));
      });
    return () => {
      cancelled = true;
    };
  }, [user, slug]);

  const startPayment = useCallback(async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "already_owned") setOwned(true);
        else if (data.code === "login_required") openSignIn();
        else if (data.code === "confirming") setNote({ tone: "info", text: data.error, libraryLink: true });
        else setNote({ tone: "error", text: data.error ?? "Could not start payment." });
        return;
      }
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        setNote({ tone: "error", text: "Could not load the payment window. Check your internet and try again." });
        return;
      }
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
        handler: (response) =>
          router.push(`/library?paid=1&order=${encodeURIComponent(response.razorpay_order_id ?? data.orderId)}`),
      });
      rzp.on("payment.failed", (r) =>
        setNote({
          tone: "error",
          text: `Payment failed${r.error?.description ? `: ${r.error.description}` : ""}. If money was deducted, your bank usually returns it in 5 to 7 working days. You can try again.`,
        }),
      );
      rzp.open();
    } catch {
      setNote({ tone: "error", text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }, [slug, user, router, openSignIn]);

  // After signing in, carry on with the purchase the student started.
  useEffect(() => {
    if (ready && user && sessionStorage.getItem("pendingBuy") === slug) {
      sessionStorage.removeItem("pendingBuy");
      Promise.resolve().then(startPayment);
    }
  }, [ready, user, slug, startPayment]);

  function onClick() {
    if (!user) {
      sessionStorage.setItem("pendingBuy", slug);
      openSignIn();
      return;
    }
    startPayment();
  }

  if (owned) {
    return (
      <Button href={`/read/${slug}`}>
        <Icon name="check" /> In your library · Read now
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onClick} disabled={busy}>
        {busy ? "Please wait…" : `Buy now · ₹${price}`} <Icon name="cart" />
      </Button>
      {note && (
        <p className={`m-0 max-w-[21rem] text-sm leading-snug ${note.tone === "error" ? "text-red-600" : "text-muted"}`} role="status">
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
