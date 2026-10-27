"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolIcon from "@/components/tools/ToolIcon";
import { Button } from "@/components/tools/ui";
import { cleanInput, funConfig, shareQuery } from "@/lib/tools/fun";

/** The input form for a Fun Zone tool. Submitting opens the share page with the finished result card. */
export default function FunRunner({ toolId }: { toolId: string }) {
  const config = funConfig[toolId];
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const input = cleanInput(value, config.maxLength);
    if (!input) {
      setError("Type something first.");
      return;
    }
    const salt = config.salt === "day" ? Math.floor(Date.now() / 86_400_000) : 0;
    router.push(`/share/${toolId}?${shareQuery(input, salt)}`);
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-line bg-white px-4 text-sm text-navy outline-none focus:border-purple-400";

  return (
    <form
      className="mx-auto max-w-xl text-center"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <h2 className="mb-2 mt-2 text-3xl font-extrabold text-navy">{config.heading}</h2>
      <p className="mx-auto max-w-md text-sm leading-6 text-muted">{config.intro}</p>
      <label className="mt-5 block text-left text-xs font-semibold text-navy">
        {config.label}
        {config.multiline ? (
          <textarea
            className={`${fieldClass} min-h-28 py-3`}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        ) : (
          <input
            className={`${fieldClass} h-13`}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
      </label>
      {error && (
        <p className="mb-0 mt-2 text-left text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
        {config.cta} <ToolIcon name="sparkles" size={17} />
      </Button>
    </form>
  );
}
