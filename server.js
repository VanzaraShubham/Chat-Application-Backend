import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectdb } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import Message from "./models/Message.js";
import cloudinary from "./lib/cloudinary.js";
// import { initSocket } from "./lib/socket.js";

// create Express app and http server  
const app = express();
const server = http.createServer(app); 

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: process.env.Client_URl, 
        methods: ["GET", "POST"],
    },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId}

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("sendMessage", async (data) => {
        try {
            const { receiverId, message } = data;
            const senderId = userId;
            const receiverSocketId = userSocketMap[receiverId];

        //     let imageUrl = "";

        //     if(message.image){
        //         const uploaded = await cloudinary.uploader.upload(message.image);
        //         imageUrl = uploaded.secure_url;
        //     }

        //     const newMessage = new Message({
        //     senderId,
        //     receiverId,
        //     text: message.text || "",   
        //     image: imageUrl,   
        //     seen: false
        // });
        //     const savedMessage = await newMessage.save();

              if (receiverSocketId) {
            // Send to receiver in real time
            io.to(receiverSocketId).emit("newMessage", message);
        }

        const senderSocketId = userSocketMap[senderId];
        if(senderSocketId) {
            io.to(senderSocketId).emit("newMessage", message);
        }

        } catch (error) {
            console.error("Error in sendMessage:", error.message)
        }       
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

// middleware setup
app.use(express.json({limit: "10mb"}));
app.use(cors());

// initSocket(server);

app.get("/", (req, res) => {
    res.send("server is live")
})
// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to mongoDB
await connectdb();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));


