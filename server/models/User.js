const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    // `unique` settles the findOne-then-create race in signUp, which the
    // application check cannot. On an existing database, run
    // `node scripts/check-email-duplicates.js` before deploying — the index
    // cannot build over duplicates.
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }
    ],
    image: {
        type: String,
        required: true,
    },
    // SHA-256 of the reset token, never the token itself.
    resetPasswordTokenHash: {
        type: String,
        index: true,
    },
    resetPasswordExpires: {
        type: Date,
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletionScheduledAt: {
        type: Date,
        default: null
    },
},
    // Add timestamps for when the document is created and last modified
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);