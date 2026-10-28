import { navigate, usePath } from "./router";

export function useRouter() {
  return { push: (to: string) => navigate(to), replace: (to: string) => navigate(to, true), back: () => window.history.back(), refresh: () => {}, prefetch: () => {} };
}
export const usePathname = () => usePath();
export const useSearchParams = () => new URLSearchParams();
