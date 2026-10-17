import type { Product } from "@/lib/product-types";
import {
  contentTypes,
  courseLabel,
  courses,
  typeLabelOf,
  termText,
  type CourseValue,
  type TypeValue,
} from "@/lib/catalog-config";
import { ordinal } from "@/lib/design/catalog";

// Filtering, sorting and URL handling for the /browse results page.
// Filters: course, semester/year and resource type. There is no subject filter:
// students type words from the document name into the search box.

// "type-<category>" sorts that category to the top (the rest follow, newest first).
export type Sort = "featured" | "price-low" | "price-high" | `type-${TypeValue}`;

export type Filters = {
  courses: CourseValue[];
  terms: number[];
  types: TypeValue[];
  q: string;
};

export type FacetOption = { value: string; label: string; count: number };

export type Facets = {
  courses: FacetOption[];
  terms: FacetOption[];
  types: FacetOption[];
};

export const sortLabels: Record<Sort, string> = {
  featured: "Newest first",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  ...(Object.fromEntries(contentTypes.map((t) => [`type-${t.value}`, t.label])) as Record<
    `type-${TypeValue}`,
    string
  >),
};

/** Dropdown groups: general orderings, then one entry per category. */
export const generalSorts: Sort[] = ["featured", "price-low", "price-high"];
export const categorySorts: Sort[] = contentTypes.map((t) => `type-${t.value}` as Sort);

type RawParams = Record<string, string | string[] | undefined>;

function listOf(params: RawParams, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value : value ? [value] : []).flatMap((v) => v.split(","));
}

export function parseParams(params: RawParams): { filters: Filters; sort: Sort } {
  const sortValue = listOf(params, "sort")[0] as Sort | undefined;
  const wantedCourses = listOf(params, "course");
  const wantedTypes = listOf(params, "type");
  const wantedTerms = listOf(params, "term").map(Number);
  return {
    filters: {
      courses: courses.map((c) => c.value).filter((v) => wantedCourses.includes(v)),
      terms: Array.from(new Set(wantedTerms.filter((n) => Number.isInteger(n) && n >= 1 && n <= 8))).sort(
        (a, b) => a - b,
      ),
      types: contentTypes.map((t) => t.value).filter((v) => wantedTypes.includes(v)),
      q: (listOf(params, "q")[0] ?? "").trim(),
    },
    sort: sortValue && sortValue in sortLabels ? sortValue : "featured",
  };
}

export function toQuery(filters: Filters, sort: Sort) {
  const query = new URLSearchParams();
  filters.courses.forEach((v) => query.append("course", v));
  filters.terms.forEach((v) => query.append("term", String(v)));
  filters.types.forEach((v) => query.append("type", v));
  if (filters.q) query.set("q", filters.q);
  if (sort !== "featured") query.set("sort", sort);
  return query.toString();
}

// Lower-case, "&" read as "and", punctuation ignored: "anatomy and physiology" finds "Anatomy & Physiology".
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Everything a search can match on for one product. */
function searchText(p: Product) {
  return normalize(
    [p.title, p.description ?? "", typeLabelOf(p.type), courseLabel(p.course), termText(p.course, p.term)].join(
      " ",
    ),
  );
}

export function filterProducts(products: Product[], filters: Filters, sort: Sort): Product[] {
  // Every word typed must appear somewhere in the product ("pharmacology questions" works).
  const words = normalize(filters.q).split(" ").filter(Boolean);
  const matching = products.filter((p) => {
    if (filters.courses.length && !filters.courses.includes(p.course)) return false;
    if (filters.terms.length && (p.term === null || !filters.terms.includes(p.term))) return false;
    if (filters.types.length && !filters.types.includes(p.type)) return false;
    if (!words.length) return true;
    const text = searchText(p);
    return words.every((word) => text.includes(word));
  });
  // `products` is already newest first, which is the default order.
  if (sort === "price-low") return [...matching].sort((a, b) => a.price - b.price);
  if (sort === "price-high") return [...matching].sort((a, b) => b.price - a.price);
  if (sort.startsWith("type-")) {
    // Chosen category first, everything else after it; both parts stay newest first.
    const first = sort.slice("type-".length);
    return [...matching.filter((p) => p.type === first), ...matching.filter((p) => p.type !== first)];
  }
  return matching;
}

export function getFacets(products: Product[]): Facets {
  const termValues = Array.from(
    new Set(products.map((p) => p.term).filter((t): t is number => t !== null)),
  ).sort((a, b) => a - b);
  return {
    courses: courses
      .map((c) => ({ value: c.value, label: c.label, count: products.filter((p) => p.course === c.value).length }))
      .filter((o) => o.count > 0),
    terms: termValues.map((t) => ({
      value: String(t),
      label: ordinal(t),
      count: products.filter((p) => p.term === t).length,
    })),
    types: contentTypes
      .map((t) => ({ value: t.value, label: t.label, count: products.filter((p) => p.type === t.value).length }))
      .filter((o) => o.count > 0),
  };
}

export function activeChips(filters: Filters): string[] {
  return [
    ...filters.courses.map(courseLabel),
    ...filters.terms.map((t) => `${ordinal(t)} semester / year`),
    ...filters.types.map(typeLabelOf),
  ];
}
