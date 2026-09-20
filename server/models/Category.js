const mongoose = require('mongoose');

// Define the Tags-Category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
});

// Exports the Tags-Category schema
module.exports = mongoose.model("Category", categorySchema);