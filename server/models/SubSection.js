const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    timeDuration: {
        type: String,
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
    }
});

// Manually delete cached model before redefining
// delete mongoose.connection.models['SubSection'];

module.exports = mongoose.model("SubSection", subSectionSchema);