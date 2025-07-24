import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const userSocketMap = new Map();


export const getSocketIdByUserId = (userId) => userSocketMap.get(userId);


export const getRoomId = (user1, user2) => {
  return [String(user1), String(user2)].sort().join("_"); 
};


export const setupSocket = (server) => {
  if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
    console.error("Error: JWT_SECRET or FRONTEND_URL missing in .env file");
    process.exit(1);
  }

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL, 
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId, callback) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        callback?.({ error: "No token provided" });
        return socket.disconnect();
      }

      try {
        const cleanToken = token.startsWith("Bearer ")
          ? token.replace("Bearer ", "")
          : token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

     
        if (!mongoose.Types.ObjectId.isValid(userId) || decoded.id !== userId) {
          callback?.({ error: "Invalid user ID or token" });
          return socket.disconnect();
        }

        userSocketMap.set(userId, socket.id); 
        socket.userId = userId; 
        callback?.({ success: true });
      } catch (err) {
        callback?.({ error: "Invalid token" });
        socket.disconnect();
      }
    });

    socket.on("callUser", ({ receiverId, signalData, from }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        const roomId = getRoomId(from, receiverId);
        io.to(receiverSocketId).emit("call:user", {
          signal: signalData,
          from,
          roomId,
        });
      }
    });


    socket.on("answerCall", ({ roomId, signal }) => {
      if (!roomId || !roomId.includes("_")) {
        return; 
      }
      const [user1Id, user2Id] = roomId.split("_");
      const initiatorId = socket.userId === user1Id ? user2Id : user1Id;
      const initiatorSocketId = userSocketMap.get(initiatorId);
      if (initiatorSocketId) {
        io.to(initiatorSocketId).emit("call:accepted", { signal });
      }
    });


    socket.on("endCall", ({ roomId }) => {
      if (!roomId || !roomId.includes("_")) {
        return;
      }
      const [user1Id, user2Id] = roomId.split("_");
      const otherUserId = socket.userId === user1Id ? user2Id : user1Id;
      const otherSocketId = userSocketMap.get(otherUserId);
      if (otherSocketId) {
        io.to(otherSocketId).emit("call:ended");
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
      }
    });
  });

  return io;
};
