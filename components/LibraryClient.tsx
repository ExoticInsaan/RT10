"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import cn from "@/lib/design/twStyles";
import { createClient } from "@/lib/supabase/client";

const SUPPORT_EMAIL = "support@toppershelf.online";
const CHECK_EVERY_MS = 3000;
const GIVE_UP_AFTER_MS = 90_000;

type Row = {
  id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  gateway_order_id: string;
  products: { title: string; slug: string } | null;
};

async function fetchRows(): Promise<Row[]> {
  const { data } = await createClient()
    .from("purchases")
    .select("id, status, gateway_order_id, products(title, slug)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Row[];
}

function Banner({
  tone,
  title,
  children,
  spinner = false,
}: {
  tone: "success" | "wait" | "warn" | "info";
  title: string;
  children?: React.ReactNode;
  spinner?: boolean;
}) {
  const colours = {
    success: "border-green-300 bg-green-50 text-green-900",
    wait: "border-line bg-white text-navy",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    info: "border-line bg-white text-navy",
  }[tone];
  return (
    <div className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${colours}`} role="status" aria-live="polite">
      {spinner ? (
        <span
          aria-hidden
          className="mt-1 inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : tone === "success" ? (
        <Icon name="check" size={18} />
      ) : null}
      <div>
        <p className="m-0 font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export default function LibraryClient() {
  const { user, ready } = useAuth();
  const params = useSearchParams();
  const justPaid = params.get("paid") === "1";
  const orderId = params.get("order");

  const [rows, setRows] = useState<Row[] | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const load = useCallback(async () => setRows(await fetchRows()), []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchRows().then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // The payment we are waiting on (the student has just come back from the payment window).
  // One order can cover several resources (one row each), so look at all rows of the order together.
  const orderRows = justPaid && orderId ? (rows ?? []).filter((r) => r.gateway_order_id === orderId) : [];
  const orderStatus: "pending" | "paid" | "refunded" | undefined = !orderRows.length
    ? undefined
    : orderRows.some((r) => r.status === "pending" || r.status === "failed")
      ? "pending"
      : orderRows.every((r) => r.status === "paid")
        ? "paid"
        : orderRows.every((r) => r.status === "refunded")
          ? "refunded"
          : undefined;
  const justBought = orderRows[0];
  const confirming = orderStatus === "pending";

  // The unlock arrives from the payment company a few seconds after paying. Keep checking.
  useEffect(() => {
    if (!confirming || timedOut) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        clearInterval(timer);
        setTimedOut(true);
        return;
      }
      load();
    }, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [confirming, timedOut, load]);

  if (!ready) return <p className="text-muted">Loading…</p>;

  if (!user) {
    return (
      <div className="max-w-sm rounded-lg border border-line bg-white p-6">
        <AuthPanel next="/library" />
      </div>
    );
  }

  if (rows === null) return <p className="text-muted">Loading your library…</p>;

  const items = rows.filter((r) => r.status === "paid" && r.products);
  const boughtTitles = orderRows.map((r) => r.products?.title).filter((t): t is string => Boolean(t));

  let banner: React.ReactNode = null;
  if (orderStatus === "paid") {
    banner = (
      <Banner tone="success" title="Payment received">
        {orderRows.length > 1 ? (
          <>All {orderRows.length} resources from your order are now in your library.</>
        ) : boughtTitles[0] ? (
          <>“{boughtTitles[0]}” is now in your library.</>
        ) : (
          "Your resource is now in your library."
        )}
        {orderRows.length === 1 && justBought.products && (
          <>
            {" "}
            <Link href={`/read/${justBought.products.slug}`} className="font-semibold underline">
              Read it now
            </Link>
          </>
        )}
      </Banner>
    );
  } else if (confirming && !timedOut) {
    banner = (
      <Banner tone="wait" title="Confirming your payment…" spinner>
        This usually takes a few seconds. Please keep this page open and do not pay again.
      </Banner>
    );
  } else if (confirming && timedOut) {
    banner = (
      <Banner tone="warn" title="Your payment is taking longer than usual">
        <p className="m-0">
          If money was deducted, your resource will appear here automatically once the bank confirms it. Please do
          not pay again. If it is not here within 30 minutes, email {SUPPORT_EMAIL} with this reference:{" "}
          <b>{orderId}</b>.
        </p>
        <button
          type="button"
          className="mt-2 cursor-pointer border-0 bg-transparent p-0 font-semibold underline"
          onClick={() => {
            setTimedOut(false);
            load();
          }}
        >
          Check again
        </button>
      </Banner>
    );
  } else if (orderStatus === "refunded") {
    banner = (
      <Banner tone="info" title="This payment was refunded">
        The money is being returned to your original payment method (usually 5 to 7 working days).
        {items.length > 0 && " You already own these resources, so nothing else is needed."}
      </Banner>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {banner}
        {!confirming && (
          <section className={cn("empty")}>
            <div className={cn("empty-art")}>
              <span className={cn("paper")}>
                <i />
                <i />
                <i />
              </span>
              <span className={cn("glass")}>
                <b />
              </span>
            </div>
            <h2>You have not bought anything yet</h2>
            <p>Resources you buy will appear here, ready whenever you need to revise.</p>
            <Button href="/browse">Browse material</Button>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      {banner}
      <ul className="m-0 grid list-none gap-3 p-0">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-[#b9cbd7]"
          >
            <span className="font-semibold text-navy">{i.products!.title}</span>
            <Link href={`/read/${i.products!.slug}`} className={cn("text-link")}>
              Read <Icon name="arrow" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
