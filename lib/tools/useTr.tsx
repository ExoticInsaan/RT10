"use client";

import { createContext, Fragment, useContext } from "react";

/**
 * Text lookup for the tools. The English sentence is the key, so the components read as normal English
 * and the website needs nothing: with no provider this just returns the English text (filling in {params}).
 * The Android app wraps the tools in a provider that swaps in Hindi, and any sentence without a Hindi line stays English.
 */
export type Tr = (en: string, params?: Record<string, string | number>) => string;

export const fillParams = (text: string, params?: Record<string, string | number>) =>
  params ? text.replace(/\{(\w+)\}/g, (_, name: string) => (name in params ? String(params[name]) : `{${name}}`)) : text;

const english: Tr = (en, params) => fillParams(en, params);

export const TrContext = createContext<Tr>(english);
export const useTr = () => useContext(TrContext);

/** Renders text where <b>…</b> marks the bold parts, so a whole sentence can be translated as one piece. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(<b>.*?<\/b>)/g).map((part, i) =>
        part.startsWith("<b>") ? <strong key={i}>{part.slice(3, -4)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}
