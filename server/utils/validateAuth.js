// utils/validateAuth.js

// Mirrors src/zod-validations/auth.validation.ts. Restated rather than imported
// because the server deploys on its own, without the client's build. Change a
// bound here and change it there too.

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const OTP_LENGTH = 6;

// Excludes "Admin", which the model enum would otherwise accept: accountType is
// the role isAdmin/isInstructor read, so an unfiltered one is self-service admin.
const SIGNUP_ACCOUNT_TYPES = ["Student", "Instructor"];

// Looser than the client's zod .email(), so nothing that passes the form is
// turned away here.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;

// Each validator returns a message to show the user, or null when the value is fine.

const validateRequired = (value, label) =>
    isFilled(value) ? null : `${label} is required`;

const validateEmail = (value) => {
    if (!isFilled(value)) {
        return "Email is required";
    }
    return EMAIL_PATTERN.test(value.trim()) ? null : "Enter a valid email address";
};

// Untrimmed: spaces in a password are the user's business.
const validatePassword = (value, label = "Password") => {
    if (typeof value !== "string" || value.length === 0) {
        return `${label} is required`;
    }
    if (value.length < PASSWORD_MIN_LENGTH) {
        return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (value.length > PASSWORD_MAX_LENGTH) {
        return `${label} must be at most ${PASSWORD_MAX_LENGTH} characters`;
    }
    return null;
};

const validateOtp = (value) =>
    isFilled(value) && value.trim().length === OTP_LENGTH
        ? null
        : `Enter the ${OTP_LENGTH}-digit OTP`;

const validateAccountType = (value) =>
    SIGNUP_ACCOUNT_TYPES.includes(value) ? null : "Choose a valid account type";

// First failure only, so one response carries one actionable message.
const firstError = (errors) => errors.find(Boolean) || null;

// The model trims on save, so lookups must trim too or a stray space reads as
// "user is not registered".
const normalizeEmail = (value) => (typeof value === "string" ? value.trim() : value);

module.exports = {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    OTP_LENGTH,
    SIGNUP_ACCOUNT_TYPES,
    validateRequired,
    validateEmail,
    validatePassword,
    validateOtp,
    validateAccountType,
    firstError,
    normalizeEmail,
};
