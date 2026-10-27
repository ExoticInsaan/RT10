"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBox } from "@/components/tools/ui";

export default function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <SearchBox
      value={value}
      onChange={setValue}
      onSubmit={() => router.push(`/the-shelf${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`)}
    />
  );
}
