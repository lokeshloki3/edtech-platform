// providers/auth-initializer.tsx
import { useEffect, type ReactNode } from 'react';

import { useCurrentUser } from '@/hooks/use-auth-query';
import { isAuthError } from '@/lib/queryRetry';
import { useAuthStore } from '@/store/auth.store';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const { error, isError } = useCurrentUser();
  const setStatus = useAuthStore((s) => s.setStatus);

  // An auth error is the normal anonymous-visitor path. Any other error
  // (offline, server down) leaves the status alone rather than falsely
  // logging the user out.
  useEffect(() => {
    if (isError && isAuthError(error)) {
      setStatus('unauthenticated');
    }
  }, [isError, error, setStatus]);

  return children;
}
