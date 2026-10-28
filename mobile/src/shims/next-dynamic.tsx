import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

type Options = { loading?: () => ReactNode; ssr?: boolean };

/** Stand-in for next/dynamic: React.lazy with the same loading placeholder. */
export default function dynamic<P extends object>(load: () => Promise<{ default: ComponentType<P> }>, options: Options = {}) {
  const Lazy = lazy(load);
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={options.loading ? options.loading() : null}>
        <Lazy {...(props as P & React.JSX.IntrinsicAttributes)} />
      </Suspense>
    );
  };
}
