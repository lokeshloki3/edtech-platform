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

dotenv.config();
const PORT = process.env.PORT || 4000;

// Import the cron job
const { scheduleUserDeletionJob } = require("./jobs/deleteInactiveUsers");

// database connect
database.connect();
// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        // origin: "http://localhost:5173",
        origin: "https://studysphere-edtech.vercel.app",
        credentials: true,
    })
)

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
    console.log(`App is running at ${PORT}`)
})