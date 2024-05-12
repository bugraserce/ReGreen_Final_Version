const mongoose = require('mongoose')


const { ObjectId } = mongoose.Schema.Types

const postsSchema = new mongoose.Schema({

    title: {
        type: String,

    },
    description: {
        type: String,

    },
    file: {
        type: String,

    },
    email: {
        type: String
    },
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
   
   
    category: {
        type: String
    },

    comments: [{
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "User" },
        info: {
            pp: String,
            username: String
        }
    }],


    likes: [{
        type: ObjectId,
        ref: "User"
    }]



}, { timestamps: true })

const PostModel = mongoose.model("posts", postsSchema)

module.exports = PostModel