const mongoose = require("mongoose");

// _id is the job name, so a second holder fails with a duplicate-key error.
// expiresAt is a lease rather than a flag, so a crashed holder does not wedge
// the job forever.
const jobLockSchema = new mongoose.Schema(
    {
        _id: { type: String },
        owner: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true, _id: false }
);

module.exports = mongoose.model("JobLock", jobLockSchema);
