import { products, typeLabel, type Product, type ProductType } from "@/lib/sample-data";
import { slug } from "@/lib/design/catalog";

// Filtering, sorting and URL handling for the /browse results page.
// Filters follow the fields the catalogue really has: course, year, subject, type, price.

export type Sort = "featured" | "price-low" | "price-high";

export type Filters = {
  courses: string[];
  years: string[];
  subjects: string[];
  types: ProductType[];
  maxPrice: number;
  q: string;
};

export type FacetOption = { value: string; label: string; count: number };

export type Facets = {
  courses: FacetOption[];
  years: FacetOption[];
  subjects: FacetOption[];
  types: FacetOption[];
};

export const sortLabels: Record<Sort, string> = {
  featured: "Featured",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
};

export const PRICE_MAX = Math.ceil(Math.max(...products.map((p) => p.price)) / 10) * 10;

const unique = (values: string[]) => Array.from(new Set(values));
const typeValues: ProductType[] = ["notes", "quiz", "test"];

// Older links (Find My Notes) use the design's resource-type names; map the ones that have a clear match.
const typeAliases: Record<string, ProductType> = {
  notes: "notes",
  "detailed-notes": "notes",
  "short-notes": "notes",
  quiz: "quiz",
  "question-banks": "quiz",
  test: "test",
  "full-test": "test",
};

export const emptyFilters: Filters = {
  courses: [],
  years: [],
  subjects: [],
  types: [],
  maxPrice: PRICE_MAX,
  q: "",
};

type RawParams = Record<string, string | string[] | undefined>;

function listOf(params: RawParams, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value : value ? [value] : []).flatMap((v) => v.split(","));
}

function pick(values: string[], options: string[]) {
  return options.filter((option) => values.includes(slug(option)));
}

export function parseParams(params: RawParams): { filters: Filters; sort: Sort } {
  const maxPrice = Number(listOf(params, "maxPrice")[0]);
  const sortValue = listOf(params, "sort")[0] as Sort | undefined;
  const types = listOf(params, "type")
    .map((t) => typeAliases[t])
    .filter((t): t is ProductType => Boolean(t));
  return {
    filters: {
      courses: pick(listOf(params, "course"), unique(products.map((p) => p.course))),
      years: pick(listOf(params, "year"), unique(products.map((p) => p.year))),
      subjects: pick(listOf(params, "subject"), unique(products.map((p) => p.subject))),
      types: typeValues.filter((t) => types.includes(t)),
      maxPrice: maxPrice > 0 && maxPrice < PRICE_MAX ? maxPrice : PRICE_MAX,
      q: (listOf(params, "q")[0] ?? "").trim(),
    },
    sort: sortValue && sortValue in sortLabels ? sortValue : "featured",
  };
}

export function toQuery(filters: Filters, sort: Sort) {
  const query = new URLSearchParams();
  filters.courses.forEach((v) => query.append("course", slug(v)));
  filters.years.forEach((v) => query.append("year", slug(v)));
  filters.subjects.forEach((v) => query.append("subject", slug(v)));
  filters.types.forEach((v) => query.append("type", v));
  if (filters.maxPrice < PRICE_MAX) query.set("maxPrice", String(filters.maxPrice));
  if (filters.q) query.set("q", filters.q);
  if (sort !== "featured") query.set("sort", sort);
  return query.toString();
}

export function filterProducts(filters: Filters, sort: Sort): Product[] {
  const q = filters.q.toLowerCase();
  const matching = products.filter(
    (p) =>
      (!filters.courses.length || filters.courses.includes(p.course)) &&
      (!filters.years.length || filters.years.includes(p.year)) &&
      (!filters.subjects.length || filters.subjects.includes(p.subject)) &&
      (!filters.types.length || filters.types.includes(p.type)) &&
      p.price <= filters.maxPrice &&
      (!q || `${p.title} ${p.subject} ${typeLabel[p.type]} ${p.course} ${p.blurb}`.toLowerCase().includes(q)),
  );
  if (sort === "price-low") return [...matching].sort((a, b) => a.price - b.price);
  if (sort === "price-high") return [...matching].sort((a, b) => b.price - a.price);
  return matching;
}

export function getFacets(): Facets {
  const make = (values: string[]): FacetOption[] =>
    unique(values).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));
  return {
    courses: make(products.map((p) => p.course)),
    years: make(products.map((p) => p.year)),
    subjects: make(products.map((p) => p.subject)),
    types: typeValues
      .map((t) => ({ value: t, label: typeLabel[t], count: products.filter((p) => p.type === t).length }))
      .filter((o) => o.count > 0),
  };
}

export function activeChips(filters: Filters): string[] {
  return [
    ...filters.courses,
    ...filters.years,
    ...filters.subjects,
    ...filters.types.map((t) => typeLabel[t]),
    ...(filters.maxPrice < PRICE_MAX ? [`Under ₹${filters.maxPrice}`] : []),
  ];
}
