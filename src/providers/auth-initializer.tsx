// providers/auth-initializer.tsx
import { useEffect, type ReactNode } from 'react';

import { useCurrentUser } from '@/hooks/use-auth-query';
import { showCustomErrorToast } from '@/lib/customToastHelper';
import { isAuthError } from '@/lib/queryRetry';
import { useAuthStore } from '@/store/auth.store';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const { error, isError } = useCurrentUser();
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (!isError) {
      return;
    }

    // Whatever the reason, there is no usable session. Leaving the status on
    // pending would strand PrivateRoute and OpenRoute on a spinner.
    setStatus('unauthenticated');

    // A 401/403 is the ordinary anonymous-visitor path, so it stays silent.
    // Anything else needs saying, or the bounce to /login looks unexplained.
    if (!isAuthError(error)) {
      showCustomErrorToast({
        message: 'Could not verify your session, please check your connection and try again',
      });
    }
  }, [isError, error, setStatus]);

  return children;
}
