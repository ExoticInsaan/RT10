import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Refund Policy" };

// ---- DETAILS USED ON THIS PAGE ---------------------------------------------
const BUSINESS = "TopperShelf";
const SUPPORT_EMAIL = "support@toppershelf.online";
const ADDRESS = "Bharatpur, Rajasthan, India";
const EFFECTIVE = "10 October 2026";
// -----------------------------------------------------------------------------

const h2 = "mt-8 text-lg font-semibold text-slate-900";
const p = "mt-2 text-slate-700 leading-relaxed";
const ul = "mt-2 list-disc space-y-1 pl-5 text-slate-700";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Refund Policy</h1>
      <p className="mt-1 text-sm text-slate-500">Effective date: {EFFECTIVE}</p>

      <p className={p}>
        This policy explains when {BUSINESS} gives refunds. It is part of our{" "}
        <Link href="/terms" className="underline">Terms of Use</Link>. Everything we sell is digital study material
        (notes, quizzes and mock tests) that you can open as soon as your payment is confirmed. Nothing is shipped.
      </p>

      <h2 className={h2}>1. Try before you buy</h2>
      <p className={p}>
        Because digital material cannot be returned once opened, we show a free sample or preview on product pages
        where possible. Please check it before you pay.
      </p>

      <h2 className={h2}>2. When you get a refund</h2>
      <p className={p}>We will refund you in full if:</p>
      <ul className={ul}>
        <li><b>Duplicate payment:</b> you were charged more than once for the same item.</li>
        <li><b>Paid but no access:</b> your payment succeeded, but the item did not unlock and we could not fix it within 24 hours of you contacting us.</li>
        <li><b>Broken file:</b> the file is corrupted, empty or cannot be opened, and we could not replace it with a working one.</li>
        <li><b>Not as described:</b> the material is clearly different from what the product page described, for example the wrong subject or far fewer questions than stated.</li>
        <li><b>Our mistake:</b> you were charged an amount different from the price shown.</li>
      </ul>
      <p className={p}>
        In these cases we will first try to fix the problem (unlock the item, replace the file or correct the content). A
        refund is given if we cannot.
      </p>

      <h2 className={h2}>3. When we do not give refunds</h2>
      <ul className={ul}>
        <li>You changed your mind, or bought the wrong item by mistake, after the material was unlocked.</li>
        <li>You already downloaded, printed or completed a large part of the material, or used up a test attempt.</li>
        <li>You did not like the style, length or difficulty, which were visible in the free sample or description.</li>
        <li>You did not get the marks or result you hoped for.</li>
        <li>Your account was suspended because the material was shared or resold, as described in the Terms.</li>
        <li>The problem was caused by your own device, browser or internet connection.</li>
      </ul>

      <h2 className={h2}>4. How to ask for a refund</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700">
        <li>Email {SUPPORT_EMAIL} within <b>7 days</b> of your payment.</li>
        <li>Write the email address you signed in with, the name of the item, the payment reference or order number (from Razorpay&apos;s message or your bank), and a short description of the problem. A screenshot helps.</li>
        <li>We will reply within 48 hours, and in most cases decide within 3 working days.</li>
      </ol>

      <h2 className={h2}>5. How and when you are paid back</h2>
      <ul className={ul}>
        <li>Approved refunds go back to the <b>same payment method</b> you used (UPI, card or bank), through Razorpay.</li>
        <li>After we approve a refund, it normally reaches you in <b>5 to 7 working days</b>. Your bank may take longer.</li>
        <li>When a refund is paid, access to that item is removed.</li>
      </ul>

      <h2 className={h2}>6. Money deducted but the order failed</h2>
      <p className={p}>
        Sometimes a payment fails after your bank has debited the amount. In that case the amount is usually returned
        automatically by your bank or Razorpay within 5 to 7 working days. If it is not returned after that, write to{" "}
        {SUPPORT_EMAIL} with your payment reference and we will help you trace it.
      </p>

      <h2 className={h2}>7. Please contact us first</h2>
      <p className={p}>
        If something is wrong, please write to us before you raise a dispute or chargeback with your bank. We can
        usually fix it faster. This does not take away any right you have under law, including under the Consumer
        Protection Act, 2019.
      </p>

      <h2 className={h2}>8. Contact</h2>
      <p className={p}>
        {BUSINESS}, {ADDRESS}. Email: {SUPPORT_EMAIL}.
      </p>
    </div>
  );
}
