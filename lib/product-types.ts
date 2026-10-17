import type { CourseValue, TypeValue } from "@/lib/catalog-config";

// A published resource as the shop shows it. Safe to import from client components.
// The paid PDF path is never included here.
export type Product = {
  id: string;
  slug: string;
  title: string;
  type: TypeValue;
  course: CourseValue;
  term: number | null;
  price: number; // rupees
  pages: number | null;
  description: string | null;
  coverUrl: string | null; // first page of the PDF, public
};

export const PRODUCT_COLUMNS =
  "id, slug, title, type, course, term, price, pages, description, cover_path";

type ProductRow = Omit<Product, "price" | "term" | "pages" | "coverUrl"> & {
  cover_path?: string | null;
  price: number | string;
  term: number | null;
  pages: number | null;
};

// Public address of a cover picture (the "covers" bucket is public).
export function coverUrlFor(path: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/covers/${path}`;
}

export function toProduct(row: ProductRow): Product {
  const { cover_path, ...rest } = row;
  return { ...rest, price: Number(rest.price), coverUrl: coverUrlFor(cover_path) };
}
