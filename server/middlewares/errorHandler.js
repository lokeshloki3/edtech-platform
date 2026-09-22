const isProd = () => process.env.NODE_ENV === "production";

const classify = (err) => {
    // Duplicate key — in practice the unique index on User.email.
    if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0];
        return {
            status: 409,
            message:
                field === "email"
                    ? "An account with this email already exists."
                    : "That value is already taken.",
        };
    }

    if (err?.name === "CastError") {
        return { status: 400, message: "Malformed identifier in request." };
    }

    if (err?.name === "ValidationError") {
        const first = Object.values(err.errors ?? {})[0];
        return { status: 400, message: first?.message ?? "Invalid request data." };
    }

    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
        return { status: 401, message: "Session is invalid or has expired." };
    }

    if (err?.status === 413 || err?.type === "entity.too.large") {
        return { status: 413, message: "Upload is too large." };
    }

    if (err instanceof SyntaxError && "body" in err) {
        return { status: 400, message: "Request body is not valid JSON." };
    }

    const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
    let message;
    if (status < 500) {
        message = err.message;
    } else if (isProd()) {
        // An error's own message is written for a developer and routinely
        // carries a connection string, path or field name.
        message = "Something went wrong. Please try again.";
    } else {
        message = err?.message ?? "Unknown error";
    }

    return { status, message };
};

// eslint-disable-next-line no-unused-vars -- Express identifies the error handler by arity.
const errorHandler = (err, req, res, next) => {
    const { status, message } = classify(err);

    if (status >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    // A response already went out. Hand back to Express, whose default handler
    // closes the connection instead of throwing again.
    if (res.headersSent) {
        return next(err);
    }

    res.status(status).json({ success: false, message });
};

// An uncaught exception leaves the process in an unknown state, so exit and let
// the supervisor restart it clean. A stray rejection only logs.
const registerProcessHandlers = () => {
    process.on("unhandledRejection", (reason) => {
        console.error("Unhandled promise rejection:", reason);
    });

    process.on("uncaughtException", (error) => {
        console.error("Uncaught exception — exiting:", error);
        process.exit(1);
    });
};

module.exports = { errorHandler, registerProcessHandlers };
