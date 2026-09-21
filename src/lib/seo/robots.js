// No env access of its own: the Node build and the browser read STAGING from
// different places, so callers pass the value in.

// Public routes (/, /about, /contact, /catalog/*, /courses/*) stay crawlable.
// The API is a separate origin, so it is not listed here — robots.txt only
// governs the host that serves it.
export const DISALLOWED_PATHS = [
  '/dashboard',
  '/view-course',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-email',
  '/update-password',
];

export const INDEXABLE = 'index, follow';
export const NOT_INDEXABLE = 'noindex, nofollow';

export const isStaging = (value) => String(value ?? 'false') === 'true';

export const isDisallowedPath = (pathname) => {
  const path = pathname.toLowerCase();
  return DISALLOWED_PATHS.some((base) => path === base || path.startsWith(`${base}/`));
};

export const buildRobotsTxt = (staging) => {
  if (staging) {
    return 'User-agent: *\nDisallow: /\n';
  }

  return ['User-agent: *', 'Allow: /', ...DISALLOWED_PATHS.map((p) => `Disallow: ${p}`), ''].join(
    '\n'
  );
};
