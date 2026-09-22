const mongoose = require('mongoose');
require("dotenv").config();

const User = require("../models/User");

// Mongoose reports a failed background index build by emitting an event nobody
// listens for. Building explicitly means the failure is visible.
const ensureIndexes = async () => {
    try {
        await User.createIndexes();
    } catch (error) {
        console.error(
            "\n🛑 Failed to build required database indexes.\n" +
            "   The unique index on User.email is what prevents duplicate accounts.\n" +
            "   If this is E11000, the collection already holds duplicate emails.\n" +
            "   Run: node scripts/check-email-duplicates.js\n",
            error.message
        );
    }
};

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(ensureIndexes)
        .catch((error) => {
            // console.log("DB connection failed");
            console.error(error);
            process.exit(1);
        })
};
