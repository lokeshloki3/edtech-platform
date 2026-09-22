// CSRF defence. The session cookie is sameSite:'none' in production, so the
// browser attaches it to cross-site writes. Rejects writes that state an origin
// we do not allow.
//
// The real fix is serving the API same-site and switching the cookie to 'lax';
// this stays afterwards as defence in depth.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const toOrigin = (value) => {
    if (!value || value === "null") {
        return null;
    }
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
};

const verifyOrigin = (allowedOrigins) => {
    const allowed = new Set(allowedOrigins);

    return (req, res, next) => {
        if (SAFE_METHODS.has(req.method)) {
            return next();
        }

        // Referer only as a fallback: some browsers and extensions strip it
        // while Origin survives.
        const stated = toOrigin(req.get("origin")) ?? toOrigin(req.get("referer"));

        // A browser always sends Origin on a cross-site write, so a request with
        // neither header is curl, Postman or a health check — not forgery.
        if (stated === null) {
            return next();
        }

        if (!allowed.has(stated)) {
            return res.status(403).json({
                success: false,
                message: "Request blocked: unrecognised origin",
            });
        }

        return next();
    };
};

module.exports = { verifyOrigin };
