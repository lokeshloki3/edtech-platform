const crypto = require("crypto");

const hashToken = (rawToken) =>
    crypto.createHash("sha256").update(String(rawToken)).digest("hex");

// timingSafeEqual throws on length mismatch, so check length first.
const safeCompareHex = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
};

module.exports = { hashToken, safeCompareHex };
