"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Sends one analytics event when it appears on screen (for example: viewing a resource, a search). */
export default function TrackEvent({ name, params }: { name: string; params?: Record<string, unknown> }) {
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    track(name, JSON.parse(key));
  }, [name, key]);
  return null;
}
