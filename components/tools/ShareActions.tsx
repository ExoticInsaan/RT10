"use client";

import { useState } from "react";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";

export default function ShareActions({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [status, setStatus] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Link copied");
    } catch {
      setStatus("Copy failed. Copy the address bar instead.");
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        /* the person closed the share sheet */
      }
    } else {
      await copyLink();
    }
  }

  return (
    <div>
      <div className="mt-7 flex flex-wrap gap-3">
        <a
          href={imageUrl}
          download="toppershelf-result.png"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-hover px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy"
        >
          <ToolIcon name="download" size={17} /> Download card
        </a>
        <Button variant="secondary" onClick={copyLink}>
          <ToolIcon name="copy" size={17} /> Copy link
        </Button>
        <Button variant="secondary" onClick={share}>
          <ToolIcon name="share" size={17} /> Share
        </Button>
      </div>
      <p className="mt-3 min-h-5 text-xs text-muted" role="status">
        {status}
      </p>
    </div>
  );
}
