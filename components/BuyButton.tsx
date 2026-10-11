"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

type RzpOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color: string };
  handler: () => void;
};
type RzpCtor = new (o: RzpOptions) => { open: () => void };

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

export default function BuyButton({ slug, price }: { slug: string; price: number }) {
  const router = useRouter();
  const { user, ready, openSignIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const startPayment = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not start payment.");
        return;
      }
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        setMessage("Could not load the payment window. Check your internet and try again.");
        return;
      }
      new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "TopperShelf",
        description: data.name,
        order_id: data.orderId,
        prefill: { email: user?.email },
        theme: { color: "#0d9488" },
        handler: () => router.push("/library?paid=1"),
      }).open();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [slug, user, router]);

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

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClick} disabled={busy}>
        {busy ? "Please wait…" : `Buy now · ₹${price}`} <Icon name="cart" />
      </Button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
