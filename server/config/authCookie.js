/**
 * One place that owns the session cookie, so the cookie's lifetime and the
 * JWT's lifetime cannot drift apart.
 *
 * Previously the JWT expired in 2h while the cookie was set for 3 days, which
 * left the browser holding a cookie whose token had already expired — every
 * request in that window came back 401 with no way to tell why.
 *
 * To change how long a session lasts, change SESSION_TTL_SECONDS only.
 */

const SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 hours

const COOKIE_NAME = "token";

/**
 * `sameSite: 'none'` + `secure` is required in production because the client
 * (Vercel) and the API are on different sites — a lax cookie would not be sent
 * on those cross-site XHRs. In development both are http://localhost, so lax
 * works and `secure` must be off or the browser drops the cookie.
 */
function getAuthCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS * 1000,
    };
}

module.exports = {
    SESSION_TTL_SECONDS,
    COOKIE_NAME,
    getAuthCookieOptions,
};
