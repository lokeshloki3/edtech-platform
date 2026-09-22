// `?from=` is attacker-controllable, so the target is validated before we
// navigate to it. An allowlist of shapes, not a blocklist of bad ones.

export const DEFAULT_REDIRECT = '/dashboard/my-profile';

// Bouncing back to an auth screen after signing in is a loop at worst and
// confusing at best.
const DISALLOWED_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
  '/verify-email',
];

export function resolveRedirectPath(
  target: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (!target) {
    return fallback;
  }

  // Rejects absolute URLs, javascript: and data:.
  if (!target.startsWith('/')) {
    return fallback;
  }

  // `//evil.com` is protocol-relative; `/\evil.com` is the same attack wearing a
  // backslash, which several browsers normalise to `//`.
  if (target.startsWith('//') || target.includes('\\')) {
    return fallback;
  }

  const pathname = target.split(/[?#]/)[0];

  if (
    DISALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return fallback;
  }

  return target;
}
