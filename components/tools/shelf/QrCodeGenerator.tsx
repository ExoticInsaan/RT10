"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/tools/ui";
import { Field, Hint, NumberField, Segmented, downloadBlob, inputClass, toNumber } from "@/components/tools/kit";

type Kind = "link" | "text" | "wifi" | "upi";

/** Wi-Fi QR strings escape \ ; , : and " with a backslash. */
const esc = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");

export function wifiPayload(ssid: string, password: string, security: "WPA" | "WEP" | "nopass") {
  return `WIFI:T:${security};S:${esc(ssid)};${security === "nopass" ? "" : `P:${esc(password)};`};`;
}

/**
 * UPI deep link in the NPCI format. The UPI ID (pa) is kept as written, with its "@": some apps don't decode
 * "%40". It is validated to plain characters first, so it never needs escaping. Name and note are percent-encoded.
 */
export function upiPayload(vpa: string, name: string, amount: number, note: string) {
  const parts = [`pa=${vpa.trim()}`, `pn=${encodeURIComponent(name.trim() || vpa.trim())}`];
  if (amount > 0) parts.push(`am=${amount.toFixed(2)}`);
  parts.push("cu=INR");
  if (note.trim()) parts.push(`tn=${encodeURIComponent(note.trim().slice(0, 50))}`);
  return `upi://pay?${parts.join("&")}`;
}

export default function QrCodeGenerator() {
  const [kind, setKind] = useState<Kind>("link");
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [vpa, setVpa] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dark, setDark] = useState("#102a4c");
  const [light, setLight] = useState("#ffffff");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  let payload = "";
  let problem = "";
  if (kind === "link") {
    const value = link.trim();
    if (value) {
      const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
      try {
        new URL(withScheme);
        payload = withScheme;
      } catch {
        problem = "That doesn't look like a web address.";
      }
    }
  } else if (kind === "text") {
    payload = text.trim() ? text : "";
  } else if (kind === "wifi") {
    if (ssid.trim()) payload = wifiPayload(ssid.trim(), wifiPass, security);
    if (ssid.trim() && security !== "nopass" && !wifiPass) problem = "Add the Wi-Fi password, or choose “No password”.";
  } else {
    const value = vpa.trim();
    if (value) {
      if (!/^[\w.-]{2,}@[a-z][a-z0-9]{1,}$/i.test(value)) problem = "A UPI ID looks like name@bank, for example riya@okicici.";
      else {
        const amt = toNumber(amount);
        if (amount && !(amt > 0 && amt <= 100000)) problem = "Amount should be between ₹1 and ₹1,00,000.";
        else payload = upiPayload(value, payee, Number.isFinite(amt) ? amt : 0, note);
      }
    }
  }

  const show = Boolean(payload) && !problem;

  useEffect(() => {
    if (!show || !canvas.current) return;
    QRCode.toCanvas(canvas.current, payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark, light },
    }).then(
      () => setError(""),
      () => setError("That's too much text for one QR code. Shorten it."),
    );
  }, [payload, show, dark, light]);

  async function download(format: "png" | "svg") {
    const options = { margin: 2, errorCorrectionLevel: "M" as const, color: { dark, light } };
    if (format === "svg") {
      const svg = await QRCode.toString(payload, { ...options, type: "svg" });
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
    } else {
      const url = await QRCode.toDataURL(payload, { ...options, width: 1024 });
      downloadBlob(await (await fetch(url)).blob(), "qr-code.png");
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="grid content-start gap-5">
        <Segmented
          label="What goes in the QR code?"
          value={kind}
          onChange={setKind}
          options={[
            { value: "link", label: "Link" },
            { value: "text", label: "Text" },
            { value: "wifi", label: "Wi-Fi" },
            { value: "upi", label: "UPI payment" },
          ]}
        />
        {kind === "link" && (
          <Field label="Web address">
            <input className={inputClass} value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. toppershelf.online" inputMode="url" />
          </Field>
        )}
        {kind === "text" && (
          <Field label="Text" hint="Up to about 500 characters scans reliably.">
            <textarea
              className={`${inputClass} h-32 py-3`}
              value={text}
              maxLength={1200}
              onChange={(e) => setText(e.target.value)}
              placeholder="Anything you want people to read when they scan"
            />
          </Field>
        )}
        {kind === "wifi" && (
          <div className="grid gap-4">
            <Field label="Network name">
              <input className={inputClass} value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="e.g. Hostel_Block_B" />
            </Field>
            <Segmented
              label="Security"
              value={security}
              onChange={setSecurity}
              options={[
                { value: "WPA", label: "WPA / WPA2" },
                { value: "WEP", label: "WEP" },
                { value: "nopass", label: "No password" },
              ]}
            />
            {security !== "nopass" && (
              <Field label="Password">
                <input className={inputClass} value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} />
              </Field>
            )}
            <p className="m-0 text-xs leading-5 text-muted">Phones that scan it can join the network without typing the password.</p>
          </div>
        )}
        {kind === "upi" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="UPI ID">
              <input className={inputClass} value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="name@bank" autoCapitalize="none" />
            </Field>
            <Field label="Name shown to payer">
              <input className={inputClass} value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="Optional" />
            </Field>
            <NumberField label="Amount" value={amount} onChange={setAmount} min={1} placeholder="Optional" suffix="₹" />
            <Field label="Note">
              <input className={inputClass} value={note} maxLength={50} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Trip share" />
            </Field>
            <p className="col-span-full m-0 text-xs leading-5 text-muted">
              Any UPI app (GPay, PhonePe, Paytm) can scan it. Leave the amount empty to let the payer choose. Double-check the
              UPI ID: money sent to a wrong ID is hard to get back.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-6">
          <ColorField label="Code colour" value={dark} onChange={setDark} />
          <ColorField label="Background" value={light} onChange={setLight} />
        </div>
      </div>

      <div className="grid content-start justify-items-center gap-4 rounded-3xl bg-surface p-6">
        {show ? (
          <>
            <canvas ref={canvas} className="h-auto w-full max-w-64 rounded-xl" aria-label="Your QR code" />
            {error ? (
              <Hint error>{error}</Hint>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => download("png")}>Download PNG</Button>
                <Button variant="secondary" onClick={() => download("svg")}>
                  SVG
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="m-0 py-20 text-center text-sm text-muted">{problem || "Your QR code appears here as you type."}</p>
        )}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-navy">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-11 cursor-pointer rounded-xl border border-line bg-white p-1"
      />
      {label}
    </label>
  );
}
