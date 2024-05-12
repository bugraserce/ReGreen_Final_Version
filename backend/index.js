const express = require('express')
const app = express();

const cors = require('cors')
const userRouter = require('./routes/user')
const profileRouter = require('./routes/userProfile')
const connectDB = require('./Db/db')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()
connectDB()

app.use(cookieParser())
app.use(express.static('public'))
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(userRouter)
app.use(profileRouter)




const server = app.listen(process.env.PORT, () => {
    console.log("Server is running")
})

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173",
    },
    pingTimeout: 60000
})

let onlineUsers = []

const addNewUser = (username, socketId) => {
    if (!onlineUsers.some(user => user.username === username)) {
        onlineUsers.push({ username, socketId });
        console.log(`User "${username}" added with socketId "${socketId}"`);
    } else {
        console.log(`User "${username}" already exists`);
    }
};


const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
}

const getUser = (username) => {
    // Check if username is defined before trimming
    if (typeof username !== 'string') {
        console.error('Username is not a string:', username);
        return null; // or handle the error appropriately
    }
    // Trim leading and trailing whitespace from the username
    const trimmedUsername = username.trim();
    // Find the user in the onlineUsers array
    return onlineUsers.find(user => user.username === trimmedUsername);
}


io.on("connection", (socket) => {


    io.emit("firstevent", " Hello tihs is test!")

    socket.on("newUser", (username) => {
        addNewUser(username, socket.id);

    })


    socket.on("sendNotification", ({ senderName, receiverName, type, postId,postPhoto,timeStamp,followedUserId }) => {
        const receiver = getUser(receiverName);
        if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit("getNotification", {
                senderName,
                receiverName,
                type,
                postId,
                postPhoto,
                followedUserId,
                timeStamp
            });
        } else {
            console.error("Receiver not found or socketId is undefined:", receiverName);
        }
    });



    socket.on("setup", (user) => {
        socket.join(user.username)
        console.log("joined user", user.username)
        socket.emit("connected");
    })




    socket.on("joinChat", (room) => {

        socket.join(room);

    })

   
   
    socket.on("newMessage", (newMessageData, receiverID,myID) => {
       // console.log("Received new message data:", newMessageData, receiverID); // Log the received data
        //console.log("my id" ,myID)
       
        const messageContent = newMessageData;
        const receiverId = receiverID; // Rename receiverID to receiverId for consistency
        const senderId = myID


        if(receiverId !== senderId) {
            socket.to(receiverId).emit("messageReceived",messageContent)
            //console.log(`Sent message to user with ID ${receiverId}`);

        }

        /*
        const senderId = newMessageData.chat.sender._id; // Extract senderId from newMessageData
        newMessageData.chat.chat.users.forEach((user) => {
            if (user._id !== senderId) {
                // Emit the 'messageReceived' event to each user except the sender
                socket.to(user._id).emit("messageReceived", newMessageData);
                console.log(`Sent message to user with ID ${user._id}`);
            }
        });
        */
    });
    

    socket.on("disconnect", () => {
        // Handle user disconnection if needed
        removeUser(socket.id);
    });



    socket.on("disconnet", () => {
        console.log("someone has dc")
    })



})


