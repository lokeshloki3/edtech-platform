const mongoose = require("mongoose");

const userDeletionLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    },
    reason: {
        type: String,
        default: "Scheduled deletion after inactivity",
    },
    courses: [
        {
            type: String,
        },
    ],
});

module.exports = mongoose.model("UserDeletionLog", userDeletionLogSchema);
