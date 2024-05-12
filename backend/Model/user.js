const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types



var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: false,
        trim: true,
        default: "",
        unique: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password can\'t contain "password"');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                throw new Error('Password must contain at least one special character');
            }
            if (value.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }
        },
        trim: true
    },
    aboutMe: {
        type: String
    },
    ProfilPhoto: {
        type: String,

    },

    followers: [{
        type: ObjectId, ref: "User",
        info: {
            pp: String,
            username: String
        }
    }],

    following: [{
        type: ObjectId, ref: "User",
        info: {
            pp: String,
            username: String
        }
    }],


    likedPosts: [{ type: ObjectId, ref: "posts" }],// Array of post ids that the user has liked
    followRequests: [{ type: ObjectId, ref: "User" }],

    profileLocked: { type: Boolean, default: false },

    blockedUsers: [{ type: ObjectId, ref: "User" }],

}, { timestamps: true })

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel