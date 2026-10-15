import type { CourseValue, TypeValue } from "@/lib/catalog-config";

// A published resource as the shop shows it. Safe to import from client components.
// The paid PDF path is never included here.
export type Product = {
  id: string;
  slug: string;
  title: string;
  type: TypeValue;
  subject: string;
  course: CourseValue;
  term: number | null;
  price: number; // rupees
  pages: number | null;
  description: string | null;
};

export const PRODUCT_COLUMNS = "id, slug, title, type, subject, course, term, price, pages, description";

type ProductRow = Omit<Product, "price" | "term" | "pages"> & {
  price: number | string;
  term: number | null;
  pages: number | null;
};

export function toProduct(row: ProductRow): Product {
  return { ...row, price: Number(row.price) };
}
