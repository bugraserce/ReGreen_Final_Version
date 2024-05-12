const mongoose = require('mongoose')

const chatModal = new mongoose.Schema({

    chatName: { type: String },

    isGroupChat: { type: Boolean },

    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },

    groupAdmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }] ,
    groupPhoto: {
        type:String
    },

    messageNotifications : [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],

    bannedFromGroup: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


}, {timestamps : true})


const ChatModel = mongoose.model("Chat", chatModal)

module.exports = ChatModel;


