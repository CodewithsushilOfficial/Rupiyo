import * as React from 'react';

const emptySubscribe = () => () => {};

/**
 * Custom React 19 hook to safely detect client-side hydration
 * using useSyncExternalStore (SSR snapshot = false, Client snapshot = true).
 * Prevents set-state-in-effect ESLint errors and Recharts hydration crashes.
 */
export function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
