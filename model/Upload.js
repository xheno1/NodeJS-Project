const mongoose = require("mongoose");

const uploadSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    file: {
        type: Array,
        default: []
    }
});

const Upload = mongoose.model('uploads', uploadSchema);
module.exports = Upload;