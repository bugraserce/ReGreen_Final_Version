const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router();
const nodemailer = require('nodemailer')
const multer = require('multer')
const UserModelDB = require('../Model/user')
const PostModelDB = require('../Model/Post');
const ChatModelDB = require('../Model/chatModal')
const MessageModelDB = require('../Model/MessageModal')
const path = require('path');
const expressAsyncHandler = require('express-async-handler');
const Message = require('../Model/MessageModal');
const mongoose = require('mongoose');
const cheerio = require('cheerio');






router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    const user = await UserModelDB.findOne({ email })
    if (user) {
        return res.json({ message: "user already existed" })
    }

    const userNameExist = await UserModelDB.findOne({ username })
    if (userNameExist) {
        return res.json({ message: "username already exist" })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = new UserModelDB({
        username,
        email,
        password: hashPassword,
        /* isAdmin*/

    })
    await newUser.save();
    return res.json({ status: true, message: "recored registered" })


})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModelDB.findOne({ email })
    if (!user) {
        return res.json({ message: "user is not registered" })
    }


    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        return res.json({ message: "password is incorrect" })
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.KEY, { expiresIn: '1d' })
    res.cookie('token', token, { httpOnly: true, maxAge: 990000 }) //httpOnly: This attribute is a security feature that, when set to true, prevents JavaScript code running on the client side from accessing the cookie. It is designed to mitigate the risk of cross-site scripting (XSS) attacks. By setting httpOnly: true, you ensure that the cookie can only be accessed and modified by the server, thus protecting sensitive information stored in the cookie from being accessed by malicious scripts.
    return res.json({ status: true, message: "login successfully" })



})


router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body
    try {
        const user = await UserModelDB.findOne({ email })
        if (!user) {
            alert("user is not exist")
            return res.json({ message: "user is not exist" })
        }

        const token = jwt.sign({ id: user.id }, process.env.KEY, { expiresIn: '5m' })

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD
            }
        });

        var mailOptions = {
            from: process.env.USER,
            to: email,
            subject: 'Reset Password',
            text: `This is the link for reseting your password: http://localhost:5173/resetPassword/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ message: "error sending email" })
            } else {
                return res.json({ status: true, message: "email sent" })
            }
        });



    } catch (err) {
        console.log(err)
    }

})


router.post('/resetPassword/:token', async (req, res) => {
    const token = req.params.token
    const { password } = req.body

    try {
        const decoded = await jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10);
        await UserModelDB.findByIdAndUpdate({ _id: id }, { password: hashPassword })
        return res.json({ status: true, message: "Password Updated" })
    } catch (err) {
        return res.json({ message: "invalid token" })
    }

})


//middleware for userTokenVerification and get information of user from the token
const verifyUser = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.json("There is no token")
    } else {
        jwt.verify(token, process.env.KEY, (err, decodedUserInfo) => {
            if (err) {
                return res.json("The token is wrong")
            } else {
                req.id = decodedUserInfo.id
                req.email = decodedUserInfo.email
                req.username = decodedUserInfo.username
                next();
            }
        })
    }

}

router.get('/', verifyUser, (req, res) => {
    return res.json({ id: req.id, email: req.email, username: req.username })

})


router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json("Success")
})
const storageOptions = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine whether the file is an image or a video and save accordingly
        const isImage = file.mimetype.startsWith('image/');
        const uploadDir = isImage ? 'Public/Images' : 'Public/Videos';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename for both images and videos
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "_" + Date.now() + ext);
    }
});

const upload = multer({
    storage: storageOptions,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // Allow only image and video file types
        const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});


router.post('/createPost', verifyUser, upload.single('file'), (req, res) => {
    //console.log(req.file)

    PostModelDB.create({
        title: req.body.title,
        description: req.body.description,
        file: req.file.filename,
        email: req.body.email,
        postedBy: req.body.id,
        category: req.body.category
    })
    //return res.json("Success") 
    //.then(result => res.json(result))
    return res.json("Success")

    //.catch(err => res.json(err))

})

router.get('/getPosts', (req, res) => {
    PostModelDB.find()
        .populate("postedBy", "username ProfilPhoto")
        .sort("-createAt")
        .populate("likes", "username ProfilPhoto")
        .then(posts => res.json(posts))
        .catch(err => res.json(err))
})

router.get('/getPostbyid/:id', (req, res) => {
    const id = req.params.id
    PostModelDB.findById({ _id: id }).populate("postedBy", "username ProfilPhoto")
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})


router.put('/editPost/:id', (req, res) => {
    const id = req.params.id
    PostModelDB.findByIdAndUpdate(
        { _id: id },
        { title: req.body.title, description: req.body.desc })
        .then(result => res.json("Succes"))
        .catch(err => res.json(err))

})

router.delete('/deletePost/:id', (req, res) => {
    const id = req.params.id
    PostModelDB.findByIdAndDelete({ _id: id })
        .then(result => res.json("Succes"))
        .catch(err => res.json(err))


})
    ;

router.get('/myposts/:id', verifyUser, async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await UserModelDB.findById(userId)
            .select('-password')
            .populate('followers', 'username ProfilPhoto')
            .populate('following', 'username ProfilPhoto');


        const myposts = await PostModelDB.find({ postedBy: userId })
            .populate('postedBy', '_id username')
            .sort('-createdAt');

        res.status(200).json({ myposts, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/getProfileInfo', verifyUser, async (req, res) => {


    try {
        const userInformation = await UserModelDB.findById(req.id)

        res.json({ userInformation })

    } catch (err) {
        console.error("something went wrong", err)
    }

})




router.put('/like', verifyUser, (req, res) => {
    PostModelDB.findByIdAndUpdate(
        req.body.postId,
        { $addToSet: { likes: req.id } },
        { new: true }
    )
        .then(updatedPost => {
            res.json(updatedPost);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});



router.put('/unlike', verifyUser, (req, res) => {
    PostModelDB.findByIdAndUpdate(req.body.postId,
        { $pull: { likes: req.id } },
        { new: true }

    )
        .then(updatedPost => {
            res.json(updatedPost);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});


router.put('/comment', verifyUser, (req, res) => {
    const comment = {
        comment: req.body.commentText,
        postedBy: req.id
    };

    // Retrieve the username and ProfilPhoto associated with the user ID
    UserModelDB.findById(req.id)

        .then(user => {
            if (user) {
                // Include the username and ProfilPhoto in the comment object

                comment.info = { pp: user.ProfilPhoto, username: user.username }


                // Update the post with the new comment
                return PostModelDB.findByIdAndUpdate(req.body.postId, {
                    $push: { comments: comment }
                }, { new: true });
            } else {
                throw new Error('User not found');
            }
        })
        .then(updatedPost => {
            res.json({ comment, updatedPost });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to add comment' });
        });
});

router.put('/declinefollow', verifyUser, async (req, res) => {
    const followReqSenderID = req.body.useWhoSendRequest;
    const decline = req.body.decline;

    if (decline) {
        try {
            // Update current user's followers
            await UserModelDB.findByIdAndUpdate(req.id, {
                $pull: { followRequests: followReqSenderID }
            }, { new: true });

            res.json({ message: "Follow request declined successfully." });
        } catch (error) {
            console.error("Error declining follow request:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(400).json({ error: "Accept parameter is missing or false" });
    }
});

///////////////////
router.put('/acceptfollow', verifyUser, async (req, res) => {
    const followReqSenderID = req.body.useWhoSendRequest;
    const accept = req.body.accept;

    if (accept) {
        try {
            // Update current user's followers
            await UserModelDB.findByIdAndUpdate(req.id, {
                $addToSet: { followers: followReqSenderID }
            }, { new: true });

            await UserModelDB.findByIdAndUpdate(req.id, {
                $pull: { followRequests: followReqSenderID }
            }, { new: true });


            // Update the sender's following list
            await UserModelDB.findByIdAndUpdate(followReqSenderID, {
                $addToSet: { following: req.id }
            }, { new: true });

            res.json({ message: "Follow request accepted successfully." });
        } catch (error) {
            console.error("Error accepting follow request:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(400).json({ error: "Accept parameter is missing or false" });
    }
});

router.get('/followRequests', verifyUser, (req, res) => {
    const myID = req.id;
    UserModelDB.findById(myID)
        .populate('followRequests', 'username ProfilPhoto')
        .then(me => {
            res.json({ followRequests: me.followRequests });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});


/*
router.put("/follow", verifyUser, (req, res) => {
    const followId = req.body.followId;

    UserModelDB.findById(followId)
        .then(userToFollow => {
            if (!userToFollow) {
                return res.status(404).json({ error: "User not found with the provided follow ID" });
            }

            // Assuming you want to include the follower's information in the followers array
            const followerInfo = { pp: userToFollow.ProfilPhoto, username: userToFollow.username };
            userToFollow.followers.info = followerInfo;

            if (userToFollow.profileLocked) {
                UserModelDB.findByIdAndUpdate(followId, {
                    $addToSet: { followRequests: req.id }
                }, { new: true }).then(updatedUser => {
                    if (!updatedUser) {
                        return res.status(404).json({ error: "User not found with the provided follow ID" });
                    }
                    return res.json({ 
                        message: "This user's profile is locked and request is sent",
                        followerInfo: followerInfo // Include follower info in the response
                    });
                })
                .catch(err => res.status(500).json({ error: "Internal server error" }));
            } else {
                // If the profile is unlocked, allow the follow operation
                UserModelDB.findByIdAndUpdate(followId, {
                    $addToSet: { followers: req.id }
                }, { new: true })
                .then(updatedUser => {
                    if (!updatedUser) {
                        return res.status(404).json({ error: "User not found with the provided follow ID" });
                    }
                    // Update the current user's following list with the followId
                    UserModelDB.findByIdAndUpdate(req.id, {
                        $addToSet: { following: followId }
                    }, { new: true })
                    .then(result => res.json({ 
                        result,
                        followerInfo: followerInfo // Include follower info in the response
                    }))
                    .catch(err => res.status(500).json({ error: "Internal server error" }));
                })
                .catch(err => res.status(500).json({ error: "Internal server error" }));
            }
        })
        .catch(err => res.status(500).json({ error: "Internal server error" }));
});

*/


/*/ follow user 
router.put("/follow",verifyUser,(req,res) => {
    const followId = req.body.followId

    UserModelDB.findById(followId)
    .then(userToFollow => {
        if(userToFollow) {

        userToFollow.followers.info= {pp: userToFollow.ProfilPhoto, username : userToFollow.username}
        console.log( userToFollow.followers.info)
        }

        if (userToFollow.profileLocked) {
            UserModelDB.findByIdAndUpdate(followId, {
                $addToSet : { followRequests: req.id}
            },{new : true}).then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found with the provided follow ID" });
                }
                return res.json({ message: "This user's profile is locked and request is sent" });
            })
            .catch(err => res.status(500).json({ error: "Internal server error" }));

        } else {
            // If the profile is unlocked, allow the follow operation
            UserModelDB.findByIdAndUpdate(followId, {
                $addToSet: { followers: req.id },
              
            }, { new: true })
            
                .then(updatedUser => {
                    
                    if (!updatedUser) {
                        return res.status(404).json({ error: "User not found with the provided follow ID" });
                    }
                    UserModelDB.findByIdAndUpdate(req.id, {
                        $addToSet: { following: followId }
                    }, { new: true })
                        .then(result => res.json(result))
                        .catch(err => res.status(500).json({ error: "Internal server error" }));
                })
                .catch(err => res.status(500).json({ error: "Internal server error" }));
        }
    })
    .catch(err => res.status(500).json({ error: "Internal server error" }));
});
*/


router.put("/follow", verifyUser, (req, res) => {
    const followId = req.body.followId;
    // Check if the profile of the user to follow is locked
    UserModelDB.findById(followId)
        .then(userToFollow => {
            if (!userToFollow) {
                return res.status(404).json({ error: "User not found with the provided follow ID" });
            }

            if (userToFollow.profileLocked) {
                UserModelDB.findByIdAndUpdate(followId, {
                    $addToSet: { followRequests: req.id }
                }, { new: true }).then(updatedUser => {
                    if (!updatedUser) {
                        return res.status(404).json({ error: "User not found with the provided follow ID" });
                    }
                    return res.json({ message: "This user's profile is locked and request is sent" });
                })
                    .catch(err => res.status(500).json({ error: "Internal server error" }));

            } else {
                // If the profile is unlocked, allow the follow operation
                UserModelDB.findByIdAndUpdate(followId, {
                    $addToSet: { followers: req.id }
                }, { new: true })
                    .then(updatedUser => {

                        if (!updatedUser) {
                            return res.status(404).json({ error: "User not found with the provided follow ID" });
                        }
                        UserModelDB.findByIdAndUpdate(req.id, {
                            $addToSet: { following: followId }
                        }, { new: true })
                            .then(result => res.json(result))
                            .catch(err => res.status(500).json({ error: "Internal server error" }));
                    })
                    .catch(err => res.status(500).json({ error: "Internal server error" }));
            }
        })
        .catch(err => res.status(500).json({ error: "Internal server error" }));
});



router.put("/unfollow", verifyUser, (req, res) => {
    const followId = req.body.followId;

    UserModelDB.findByIdAndUpdate(followId, {
        $pull: { followers: req.id, followRequests: req.id }

    }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found with the provided follow ID" });
            }
            UserModelDB.findByIdAndUpdate(req.id, {
                $pull: { following: followId }
            }, { new: true })
                .then(result => res.json(result))
                .catch(err => res.status(500).json({ error: "Internal server error" }));

        }).catch(err => res.status(500).json({ error: "Internal server error" }));
});


router.post("/uploadProfilePhoto", verifyUser, upload.single('profilePicture'), (req, res) => {

    const profilePicture = req.file.filename

    UserModelDB.findByIdAndUpdate(req.id, {
        $set: { ProfilPhoto: profilePicture }
    }, { new: true })
        .then(updatedProfilePic => {
            if (!updatedProfilePic) {
                return res.status(404).json({ error: "there is no pp" })
            } else {
                return res.json(updatedProfilePic)
            }
        })



})


router.post("/removeProfilePhoto", verifyUser, (req, res) => {
    UserModelDB.findByIdAndUpdate(
        req.id,
        { $unset: { ProfilPhoto: "" } }, //  $unset to remove the ProfilPhoto field
        { new: true }
    )
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(updatedUser);
        })
        .catch(err => {
            console.error("Error removing profile photo:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});



router.get('/getProfileInf', verifyUser, async (req, res) => {
    try {
        const user = await UserModelDB.findById({ _id: req.id }).select("-password");

        res.status(200).json({ user });
    } catch (err) {
        // Handle any errors
        res.status(500).json({ error: err.message });
    }
});

router.post('/editBasicInfos', verifyUser, async (req, res) => {
    try {
        const { email, username, aboutMe } = req.body;
        const updates = {};

        // Check if email, username, or aboutMe are provided and update the corresponding fields
        if (email) {
            updates.email = email;
        }
        if (username) {
            updates.username = username;
        }
        if (aboutMe) {
            updates.aboutMe = aboutMe;
        }

        // Update the user's basic information in the database
        const updatedUser = await UserModelDB.findByIdAndUpdate(
            req.id,
            updates,
            { new: true }
        );

        // Check if the user is found
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found with the provided ID' });
        }

        // Return the updated user
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating basic info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/changePassword', verifyUser, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Check if oldPassword is provided
        if (!oldPassword) {
            return res.status(400).json({ error: 'Old password is required' });
        }

        // Retrieve the user from the database
        const user = await UserModelDB.findById(req.id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided old password with the one stored in the database
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        // If the old password doesn't match, return an error
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        // Hash the new password before updating it in the database
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await UserModelDB.findByIdAndUpdate(req.id, { password: hashedNewPassword });

        // Respond with a success message
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {};

    try {
        const users = await UserModelDB.find(keyword).find({
            _id: { $ne: req.id }
        });
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server Error' });
    }
});

const accesChat = expressAsyncHandler(async (req, res) => {
    const { userID, username } = req.body;

    if (!userID) {
        console.log("UserID parameter not sent with request");
        return res.status(400).json({ message: "UserID parameter not sent with request" });
    }

    try {
        var isChat = await ChatModelDB.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.id } } },
                { users: { $elemMatch: { $eq: userID } } },
            ],
        })
            .populate("users", "-password")
            .populate("lastMessage");

        isChat = await UserModelDB.populate(isChat, {
            path: "lastMessage.sender",
            select: "username email",
        });

        if (isChat.length > 0) {
            return res.status(200).json(isChat[0]);
        } else {
            var chatData = {
                chatName: username,
                isGroupChat: false,
                users: [req.id, userID],
            };

            const createdChat = await ChatModelDB.create(chatData);
            const fullChat = await ChatModelDB.findOne({ _id: createdChat._id }).populate("users", "-password");
            return res.status(200).json(fullChat);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


const fetchChats = expressAsyncHandler(async (req, res) => {

    try {
        ChatModelDB.find({ users: { $elemMatch: { $eq: req.id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("lastMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await UserModelDB.populate(results, {
                    path: "latestMessage.sender",
                    select: "username email",
                });
                res.status(200).send(results)
            })


    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }


})

const fetchGroups = expressAsyncHandler(async (req, res) => {
    try {
        const { query } = req.query;
        let groups;

        // If a query is provided, search for groups that match the query
        if (query) {
            groups = await ChatModelDB.find({
                isGroupChat: true,
                chatName: { $regex: query, $options: "i" } // Case-insensitive partial matching
            });
        } else {
            // If no query is provided, fetch all groups
            groups = await ChatModelDB.find({ isGroupChat: true });
        }

        res.status(200).json(groups);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
    // Check if a file was uploaded and get its filename
    const groupPhoto = req.file.filename

    // Check for insufficient data
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Data is insufficient" });
    }

    // Prepare the users array
    const users = req.body.users;
    console.log("chatController/createGroups : ", req);
    users.push(req.user);

    try {
        // Create the group chat document
        const groupChat = await ChatModelDB.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.id,
            groupPhoto: groupPhoto // Assign the group photo filename
        });

        // Populate the group chat document with user and admin details
        const fullGroupChat = await ChatModelDB.findOne({ _id: groupChat })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        // Send the populated group chat document as JSON response
        res.status(200).json(fullGroupChat);
    } catch (err) {
        // Handle any errors that occur during database operations
        res.status(400).json({ message: err.message });
    }
});


const groupExit = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const removed = await ChatModelDB.findByIdAndUpdate(chatId)
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(404);
        throw new Error("Chat not found")
    } else {
        res.json(removed)
    }


})

const addSelfToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const groupChat = await ChatModelDB.findById(chatId);

        if (!groupChat) {
            return res.status(404).json({ msg: "Group not found" });
        }

        if (groupChat.bannedFromGroup.includes(req.id)) {
            // User is banned from the group
            return res.status(403).json({ msg: "You are banned from this group" });
        }else {
            await ChatModelDB.findByIdAndUpdate(chatId, {
                $addToSet: { users: userId }
            }, { new: true }).populate("users", "-password");

        }

        // User added successfully
        return res.status(200).json({ msg: "User added to the group successfully" });
    } catch (error) {
        console.error("Error adding user to the group:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


const allMessages = expressAsyncHandler(async (req, res) => {
    const chatId = req.params.chatId;

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chatId" });
    }

    try {
        const messages = await MessageModelDB.find({ chat: chatId })
            .populate("sender", "username email")
            .populate("receiver")
            .populate("chat");

        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.sendStatus(400);
    }

    var newMessage = {
        chat: chatId,
        sender: req.id,
        content: content,

    };

    try {
        var message = await Message.create(newMessage)
        message = await message.populate("sender", "name")
        message = await message.populate("chat")
        message = await message.populate("receiver");
        message = await message.populate(message, {
            path: "chat.users",
            select: "username email",
        });

        await ChatModelDB.findByIdAndUpdate(req.body.chatId, { lastMessage: message });
        res.json(message);

    } catch (err) {
        res.status(500).json({ message: err.message })
    }

})




router.post("/newChat", verifyUser, accesChat); //create new Chat particular user

router.get("/getChats", verifyUser, fetchChats);

router.post("/createGroup", verifyUser, upload.single('groupPhoto'), async (req, res) => {
    const groupPhoto = req.file ? req.file.filename : null;

    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Data is insufficient" });
    }

    // Ensure req.body.users is an array
    const users = Array.isArray(req.body.users) ? req.body.users : [req.body.users];

    try {
        // Add the current user to the array
        users.push(req.user);

        const groupChat = await ChatModelDB.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.id,
            groupPhoto: groupPhoto
        });

        const fullGroupChat = await ChatModelDB.findOne({ _id: groupChat })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

});


router.get("/fetchGroups", verifyUser, fetchGroups)
router.put("/addSelfToGroup", verifyUser, addSelfToGroup)

/*
router.put("/groupExit",verifyUser,groupExit)
*/

router.post("/sendMessage", verifyUser, async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    try {
        var message = await MessageModelDB.create({
            sender: req.id,
            content: content, // Include the content field
            chat: chatId,
        });

        console.log(message);
        message = await message.populate("sender", "_id");
        message = await message.populate("chat");
        message = await message.populate("receiver");
        message = await UserModelDB.populate(message, {
            path: "chat.users",
            select: "username email",
        });

        await ChatModelDB.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
        // Include the content field in the response object
        res.json({ messageContent: content, chat: message });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});

router.get("/getChatId/:chatId", verifyUser, async (req, res) => {
    const chatId = req.params.chatId;

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chatId" });
    }

    try {
        // Check if the chat exists
        const chatExists = await ChatModelDB.exists({ _id: chatId });
        if (!chatExists) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Fetch messages and populate fields including the sender and receiver
        const messages = await MessageModelDB.find({ chat: chatId })
            .populate("sender", "username email")
            .populate("receiver", "username"); // Populate the receiver field

        return res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})


router.get('/search-users', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "No search query provided" });
        }

        // Use regex for partial matching and 'i' for case insensitive
        const users = await UserModelDB.find({
            username: { $regex: query, $options: "i" }
        }).limit(10);  // Limit results to prevent overload

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accessing the database" });
    }
});


router.get('/search-groups', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "No search query provided" });
        }

        // Use regex for partial matching and 'i' for case insensitive
        const groupChat = await ChatModelDB.find({
            isGroupChat: true,
            chatName: { $regex: query, $options: "i" }
        }).limit(10);  // Limit results to prevent overload

        res.json(groupChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accessing the database" });
    }
});



/*
router.get('/search-users', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "No search query provided" });
        }
        // Use regex for partial matching and 'i' for case insensitive
        const users = await UserModelDB.find({
            username: { $regex: query, $options: "i" }
        }).limit(10);  // Limit results to prevent overload

        // Map the users array to include only necessary information
        const mappedUsers = users.map(user => ({
            userId: user._id, // Assuming _id is the user ID field
            username: user.username
        }));

        res.json(mappedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accessing the database" });
    }
});
*/
router.delete('/deleteChat/:id', verifyUser, async (req, res) => {

    const Chatid = req.params.id
    const groupAdminID = req.id

    try {
        const chat = await ChatModelDB.findById(Chatid);
        if (!chat) {
            return res.status(404).json({ message: "Chat is not found" });
        }

        if (chat.isGroupChat) {
            if (chat.groupAdmin.toString() === groupAdminID) {
                ChatModelDB.findByIdAndDelete(Chatid)
                    .then(() => res.json({ message: "Group Chat is deleted Succesfully" }))
                    .catch((err) => res.status(500).json({ message: "Internal Server Error", error: err }));
            } else {
                return res.status(403).json({ message: "You are not the group admin. You are not authorized to delete this group" });
            }
        } else {
            ChatModelDB.findByIdAndDelete(Chatid)
                .then(() => res.json({ message: "Chat is deleted Succesfully" }))
                .catch((err) => res.status(500).json({ message: "Internal Server Error", error: err }));
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err });
    }

});


router.put('/removeUser', verifyUser, (req, res) => {
    const clickedUserID = req.body.userID

    UserModelDB.findByIdAndUpdate(req.id, {
        $pull: { followers: clickedUserID }
    }).then(() => res.json({ msg: "User is removed from the followers" }))
        .catch((err) => res.json({ msg: "Error", err }))



})

router.get('/api/news', async (req, res) => {
    try {
        // Fetch data from the target URL
        const response = await fetch('https://www.euronews.com/tag/recycling');
        const html = await response.text();

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract article data
        const articles = [];
        $('.m-object').each((index, element) => {
            const article = {
                title: $(element).find('.qa-article-title').text().trim(),
                description: $(element).find('.m-object__description').text().trim(),
                // Convert Unix timestamp to readable date format
                date: new Date(parseInt($(element).find('.m-object__date').attr('datetime'))),
                image: $(element).find('img.m-img').attr('src'),
                link: $(element).find('.qa-article-title').attr('href') || $(element).find('.m-object__body a').attr('href') // Extract link from the article title or body
            };
            articles.push(article);
        });

        // Send the extracted data to the frontend
        console.log("Extracted data:", articles);
        res.json(articles);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

router.post('/updatePrivacy', async (req, res) => {
    const { userId, isPrivate } = req.body;

    try {
        // Update user's privacy settings in the database
        await UserModelDB.findByIdAndUpdate(userId, { profileLocked: isPrivate });

        // Fetch the updated user object
        const updatedUser = await UserModelDB.findById(userId);

        res.status(200).json({ success: true, message: 'Privacy settings updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update privacy settings' });
    }

});


router.put('/removeUser', verifyUser, (req, res) => {
    const clickedUserID = req.body.userID

    UserModelDB.findByIdAndUpdate(req.id, {
        $pull: { followers: clickedUserID }
    }).then(() => res.json({ msg: "User is removed from the followers" }))
        .catch((err) => res.json({ msg: "Error", err }))



})

router.put('/blockUser', verifyUser, (req, res) => {
    const blockedUserID = req.body.userID;
    console.log(blockedUserID)
    UserModelDB.findByIdAndUpdate(req.id, {
        $addToSet: { blockedUsers: blockedUserID }
    }, { new: true }) // This option will return the document after it was updated
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ msg: "User not found" });
            }
            console.log("Updated User:", updatedUser);
            res.json({ msg: "User is blocked", updatedUser });
        })
        .catch((err) => {
            console.error("Error updating user:", err);
            res.status(500).json({ msg: "Error updating user", err });
        });
})


router.get('/getBlockedUsers', verifyUser, async (req, res) => {

    try {
        const me = await UserModelDB.findById(req.id)
            .select("blockedUsers")
            .populate("blockedUsers", "username ProfilPhoto")
        if (!me) {
            return res.status(404).json({ msg: " user(me) not found" })
        }

        res.json(me.blockedUsers)



    } catch (err) {
        res.status(500).json({ msg: "Failed to retrieve blocked users", error: err });
    }


})

router.put('/unBlockUser', verifyUser, async (req, res) => {
    const unBlockedUserID = req.body.userID;

    try {
        const me = await UserModelDB.findByIdAndUpdate(
            req.id,
            { $pull: { blockedUsers: unBlockedUserID } },
            { new: true }
        );

        if (!me) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ msg: "User successfully unblocked", updatedUser: me });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({ msg: "Failed to unblock user", error: err });
    }
});

router.delete('/deleteComment', verifyUser, async (req, res) => {
    const { commentID, postID } = req.body;
    console.log(commentID, postID)

    try {
        // Find the post containing the comment
        const post = await PostModelDB.findByIdAndUpdate(
            postID,
            { $pull: { comments: { _id: commentID } } }, // Pull (remove) the comment from the comments array
            { new: true } // Return the updated post
        );

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        res.json({ msg: "Comment deleted successfully" });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ msg: "Failed to delete comment", error: err });
    }
});


router.post("/messageNotification", verifyUser, async (req, res) => {
    const receiverID = req.body.receiverID;
    const chatID = req.body.chatId
    console.log("Receiver Id:", receiverID);
    
    try {
        const updatedMe = await ChatModelDB.findByIdAndUpdate(chatID, {
            $push: { messageNotifications: receiverID }
        }, { new: true });

        const updatedReceiver = await ChatModelDB.findByIdAndUpdate(chatID, {
            $push: { messageNotifications: req.id }
        }, { new: true });

        res.json({ msg: "Message notifications updated successfully", updatedMe, updatedReceiver });
    } catch (err) {
        console.error("Error updating message notifications:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});


router.delete("/clearMessageNotifications", verifyUser, async (req, res) => {
    const otherUserId = req.body.otherUserID;
    const chatId = req.body.chatID;
    console.log(otherUserId, chatId);

    try {
        // Find the chat by ID and update the messageNotifications array
        const chat = await ChatModelDB.findByIdAndUpdate(
            chatId,
            { $pullAll: { messageNotifications: [otherUserId] } }, // Use $pullAll to remove all occurrences of otherUserId
            { new: true }
        );

        return res.status(200).json({ msg: "Message notifications cleared successfully" });
    } catch (error) {
        console.error("Error clearing message notifications:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/deleteMyAccount",verifyUser,async (req,res) => {

    try {
        await UserModelDB.findByIdAndDelete({_id : req.id})
        .then(result => res.json("Succes"))
        
        await PostModelDB.findOneAndDelete({postedBy : req.id})
        
        await MessageModelDB.findOneAndDelete({sender: req.id})
    


    }catch(err) {
        console.error("Error deleteing account",err)
    }

})
router.get('/getGroupData/:chatId', verifyUser, async (req, res) => {
    const chatId = req.params.chatId;

    try {
        // Using the lean method to improve performance since we don't need a full Mongoose document
        let groupChat = await ChatModelDB.findById(chatId).lean();

        if (!groupChat) {
            return res.status(404).json({ message: 'Group chat not found' });
        }

        if (groupChat.isGroupChat) {
            groupChat = await ChatModelDB.findById(chatId)
                .populate("groupAdmin", "username ProfilPhoto")
                .populate("bannedFromGroup", "username ProfilPhoto")
                .populate("users", "username ProfilPhoto")
                .lean(); // Assuming you still don't need a full Mongoose doc
        }

        res.status(200).json(groupChat);
    } catch (err) {
        console.error("Error getting GroupData info", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.put('/removeUserFromGroup/:chatId', verifyUser, async (req, res) => {
    const chatId = req.params.chatId;
    const userID = req.body.userID;

    try {
        let groupChat = await ChatModelDB.findById(chatId);
        
        if (!groupChat) {
            return res.status(404).json({ message: 'Group chat not found' });
        }

        if (groupChat.isGroupChat) {
                // If the user is removing themselves
                if (groupChat.groupAdmin.toString() === userID) {
                    // Check if the removed user is the admin
                    if (groupChat.users.length > 1) {
                        // If there are other users in the group, designate the last user as the new admin
                        const newAdminID = groupChat.users[groupChat.users.length - 1]._id;
                        groupChat.groupAdmin = newAdminID;
                    } else {
                        // If the removed user is the only one in the group, there will be no admin
                        groupChat.groupAdmin = null;
                    }
                }
                // Remove the user from the group
                await ChatModelDB.findByIdAndUpdate(chatId, {
                    $pull : { users: userID },
                    $set: { groupAdmin: groupChat.groupAdmin } // Update groupAdmin field
                },{new:true});
            
        }

        res.status(200).json(groupChat);
    } catch(err) {
        console.error("Error removing user from group", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/makeAdmin/:chatId', async (req, res) => {
    const chatId = req.params.chatId;
    const userID = req.body.userID;

    try {
        let Chat = await ChatModelDB.findById(chatId);
        
        if (!Chat) {
            return res.status(404).json({ message:  'Chat not found' });
        }

        if (Chat.isGroupChat) {
            await ChatModelDB.findByIdAndUpdate(chatId, {
                $addToSet: { groupAdmin: userID }
            });
        }

        res.status(200).json(Chat);
    } catch(err) {
        console.error("Error adding admin", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/banUserFromGroup/:chatId', verifyUser, async (req, res) => {
    const chatId = req.params.chatId;
    const UserID = req.body.userID;

    try {
        const Chat = await ChatModelDB.findById(chatId);
        if (!Chat) {
            return res.status(404).json({ msg: "groupChat is not found" });
        }
        if(req.id === UserID) {
            return res.status(404).json({msg :"you can not banned yourself"})
        }

        if (Chat.isGroupChat) {
            await ChatModelDB.findByIdAndUpdate(chatId, {
                $addToSet: { bannedFromGroup: UserID },
                $pull: { users: UserID, groupAdmin: UserID }
            }, { new: true });
        }
        res.status(200).json(Chat);
    } catch (err) {
        console.error("Error user ban", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/unBanUserFromGroup/:chatId',async (req,res) => {
    const chatId = req.params.chatId;
    const userID = req.body.userID;

    try{
        const Chat = await ChatModelDB.findById(chatId)

        if(!Chat) {
            return res.status(404).json({msg:"There is no groupChat"})
        }

        if(Chat.isGroupChat) {
            await ChatModelDB.findByIdAndUpdate(chatId ,{
                $pull : { bannedFromGroup : userID}
            })

        }

        res.status(200).json(Chat);


    }catch(err){
        console.error("Error user unbanned")
        res.status(500).json({ message: 'Internal server error' });

    }


})

router.put('/exitFromTheGroup/:chatId', verifyUser, async (req, res) => {
    const chatID = req.params.chatId; // Access chatId from req.params

    try {
        const chat = await ChatModelDB.findById(chatID);
        if (!chat) {
            return res.status(404).json({ msg: "Chat not found" }); // Changed 'chat not found' to 'Chat not found'
        }

        if (chat.isGroupChat) {
            await ChatModelDB.findByIdAndUpdate(chatID, {
                $pull: { users: req.id }
            }, { new: true });

            res.status(200).json(chat);
        }
    } catch (err) {
        console.error("Error while exiting group:", err); // Changed log message
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router