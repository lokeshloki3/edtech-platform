const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

const { verifyOrigin } = require("./middlewares/verifyOrigin");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Import the cron job
const { scheduleUserDeletionJob } = require("./jobs/deleteInactiveUsers");

// database connect
database.connect();

// Required for the rate limiters to key on the real client IP rather than the
// proxy's. Must stay `1`, not `true` — `true` trusts the whole client-controlled
// X-Forwarded-For chain, letting anyone reset their own bucket.
app.set("trust proxy", 1);

// middlewares
// robots.txt stops crawling; X-Robots-Tag also stops a URL found via a link
// from being indexed, which robots.txt alone does not prevent.
app.use((req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
});

app.get("/robots.txt", (req, res) => {
    return res.type("text/plain").send("User-agent: *\nDisallow: /\n");
});

app.use(express.json());
app.use(cookieParser());
// The session cookie is cross-site in production, so the allowed origins have
// to be exact (no "*") and credentials must be on, or the browser silently
// drops the cookie. Set CORS_ORIGINS to a comma-separated list per environment.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)

// CSRF defence for cross-site writes. Shares the CORS list so the two cannot drift.
app.use(verifyOrigin(allowedOrigins));

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
)
// cloudinary connection
cloudinaryConnect();

// Start the cron job BEFORE server starts and after db connection
scheduleUserDeletionJob();

// mount routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// default route
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Your server is up and running.'
    });
});

// activate the server
app.listen(PORT, () => {
    // console.log(`App is running at ${PORT}`)
})
