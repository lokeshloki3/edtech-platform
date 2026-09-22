const crypto = require("crypto");
const JobLock = require("../models/JobLock");

const OWNER = `${process.pid}-${crypto.randomBytes(4).toString("hex")}`;

// Runs task only if no other process holds the lock. Returns false when someone
// else has it, which is a normal outcome rather than an error.
// ttlMs must exceed the task's worst-case runtime.
const withJobLock = async (name, ttlMs, task) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    try {
        // Matches only a lapsed lease; a live one makes the upsert collide on
        // _id and throw E11000.
        await JobLock.findOneAndUpdate(
            { _id: name, expiresAt: { $lte: now } },
            { $set: { owner: OWNER, expiresAt } },
            { upsert: true, new: true }
        );
    } catch (error) {
        if (error?.code === 11000) {
            return false;
        }
        throw error;
    }

    try {
        await task();
        return true;
    } finally {
        // Owner-scoped, so a run that overshot its lease cannot release the new
        // holder's lock.
        await JobLock.deleteOne({ _id: name, owner: OWNER }).catch((error) => {
            console.error(`Failed to release job lock "${name}":`, error);
        });
    }
};

module.exports = { withJobLock };
