// Reports accounts that would block the unique index on User.email.
// Read-only — run before deploying the index against an existing database.
//
//   node scripts/check-email-duplicates.js
//
// Compares case-insensitively, since email is now stored lowercased.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
    if (!process.env.MONGODB_URL) {
        console.error("MONGODB_URL is not set. Check server/.env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL);

    const duplicates = await User.aggregate([
        { $group: { _id: { $toLower: "$email" }, count: { $sum: 1 }, ids: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } },
    ]);

    if (duplicates.length === 0) {
        console.log("No duplicate emails. The unique index will build cleanly.");
    } else {
        console.log(`${duplicates.length} email(s) are held by more than one account:\n`);
        for (const entry of duplicates) {
            console.log(`  ${entry._id} — ${entry.count} accounts`);
            for (const id of entry.ids) {
                console.log(`      ${id}`);
            }
        }
        console.log("\nCheck which account holds enrolments and purchases before removing anything.");
    }

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error("Duplicate check failed:", error);
    process.exit(1);
});
