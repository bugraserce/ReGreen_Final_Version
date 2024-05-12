const express = require('express')
const router = express.Router();
const PostModelDB = require('../Model/Post')
const UserModelDB = require('../Model/user')

//otherUsers
router.get("/userProfile/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Find the user by ID, excluding the password field
        const user = await UserModelDB.findById({_id : id})
        .select("-password")
          .populate('followers', 'username ProfilPhoto')
           .populate('following', 'username ProfilPhoto');
        // If user is not found, return 404 error
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Find posts by the user
        const postsOfUser = await PostModelDB.find({ postedBy: id }).populate("postedBy", "_id ProfilPhoto username");
        // Return user and posts
        res.status(200).json({ user, postsOfUser });
    } catch (err) {
        // Handle errors
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;