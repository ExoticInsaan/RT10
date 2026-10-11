"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import { PRICE_MAX, toQuery, type FacetOption, type Facets, type Filters, type Sort } from "@/lib/browse";
import type { ProductType } from "@/lib/sample-data";

function toggle<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

function Check({
  option,
  checked,
  onChange,
}: {
  option: FacetOption;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={cn("check")}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>
        {option.label} <em>({option.count})</em>
      </span>
    </label>
  );
}

const SUBJECTS_SHOWN = 5;

/** Filter checkboxes + price slider. Filters are drafted locally and applied to the URL on "Apply filters". */
export default function FilterControls({
  initial,
  facets,
  sort,
  onApplied,
}: {
  initial: Filters;
  facets: Facets;
  sort: Sort;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Filters>(initial);
  const [showAll, setShowAll] = useState(false);
  const visibleSubjects = showAll ? facets.subjects : facets.subjects.slice(0, SUBJECTS_SHOWN);

  const apply = () => {
    const query = toQuery(draft, sort);
    router.push(query ? `/browse?${query}` : "/browse");
    onApplied?.();
  };

  return (
    <div className={cn("filter-controls")}>
      <fieldset>
        <legend>Course</legend>
        {facets.courses.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.courses.includes(option.value)}
            onChange={() => setDraft({ ...draft, courses: toggle(draft.courses, option.value) })}
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Year</legend>
        {facets.years.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.years.includes(option.value)}
            onChange={() => setDraft({ ...draft, years: toggle(draft.years, option.value) })}
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Subject</legend>
        {visibleSubjects.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.subjects.includes(option.value)}
            onChange={() => setDraft({ ...draft, subjects: toggle(draft.subjects, option.value) })}
          />
        ))}
        {facets.subjects.length > SUBJECTS_SHOWN && (
          <Button variant="ghost" className={cn("show-more")} onClick={() => setShowAll(!showAll)}>
            {showAll ? "− Show less" : "+ Show more"}
          </Button>
        )}
      </fieldset>
      <fieldset>
        <legend>Resource type</legend>
        {facets.types.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.types.includes(option.value as ProductType)}
            onChange={() =>
              setDraft({ ...draft, types: toggle(draft.types, option.value as ProductType) })
            }
          />
        ))}
      </fieldset>
      <fieldset className={cn("range-field")}>
        <legend>Price range</legend>
        <input
          aria-label="Maximum price"
          type="range"
          min="0"
          max={PRICE_MAX}
          step="1"
          value={draft.maxPrice}
          onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })}
        />
        <div>
          <span>₹0</span>
          <span>₹{draft.maxPrice}</span>
        </div>
      </fieldset>
      <Button className={cn("apply")} onClick={apply}>
        Apply filters
      </Button>
    </div>
  );
}
