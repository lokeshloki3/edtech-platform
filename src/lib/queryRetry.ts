import type { AxiosError } from 'axios';

// Reads the status off a raw AxiosError as well as the ClientRequestError that
// handleClientAxiosError rethrows, since services unwrap before React Query sees it.
export function isAuthError(error: unknown): boolean {
  const status =
    (error as AxiosError | undefined)?.response?.status ??
    (error as { status?: number } | undefined)?.status;

  return status === 401 || status === 403;
}

export function retryUnlessAuth(max = 1) {
  return (failureCount: number, error: unknown) => !isAuthError(error) && failureCount < max;
}
