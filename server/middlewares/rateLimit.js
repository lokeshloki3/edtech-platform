const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// In-memory: counters reset on restart and are not shared across instances.
// Swap in rate-limit-redis when Redis lands. Depends on trust proxy in index.js.

const message = (text) => ({ success: false, message: text });

const base = {
    standardHeaders: "draft-7",
    legacyHeaders: false,
};

const loginLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    message: message("Too many sign-in attempts. Please try again in 15 minutes."),
});

// Keyed on IP + target email so neither axis is free. ipKeyGenerator normalises
// IPv6 to its /64, otherwise one subscriber holds trillions of buckets.
const emailDispatchLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 3,
    keyGenerator: (req) => {
        const target = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        return `${ipKeyGenerator(req.ip)}:${target}`;
    },
    message: message("Too many requests for this email. Please try again in an hour."),
});

module.exports = { loginLimiter, emailDispatchLimiter };
