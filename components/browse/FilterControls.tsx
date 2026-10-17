"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import { toQuery, type FacetOption, type Facets, type Filters, type Sort } from "@/lib/browse";
import type { CourseValue, TypeValue } from "@/lib/catalog-config";

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

/** Filter checkboxes. Filters are drafted locally and applied to the URL on "Apply filters". */
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
            checked={draft.courses.includes(option.value as CourseValue)}
            onChange={() =>
              setDraft({ ...draft, courses: toggle(draft.courses, option.value as CourseValue) })
            }
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Semester / Year</legend>
        {facets.terms.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.terms.includes(Number(option.value))}
            onChange={() => setDraft({ ...draft, terms: toggle(draft.terms, Number(option.value)) })}
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Resource type</legend>
        {facets.types.map((option) => (
          <Check
            key={option.value}
            option={option}
            checked={draft.types.includes(option.value as TypeValue)}
            onChange={() => setDraft({ ...draft, types: toggle(draft.types, option.value as TypeValue) })}
          />
        ))}
      </fieldset>
      <Button className={cn("apply")} onClick={apply}>
        Apply filters
      </Button>
    </div>
  );
}
