const mongoose = require('mongoose');

const messageModal = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: { // Corrected field name
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    content: {
        type: String
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageModal);
module.exports = Message;
