import { Server } from "socket.io";

export let io = null;
export const userSocketMap = {};

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("userOnline", (userId) => {
      userSocketMap[userId] = socket.id;
      io.emit("onlineUsers", Object.keys(userSocketMap));
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) delete userSocketMap[uid];
      }
      io.emit("onlineUsers", Object.keys(userSocketMap));
    });
  });
}
