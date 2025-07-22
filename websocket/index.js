import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "../models/Message.js";

export const userSocketMap = new Map();

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) return;
      userSocketMap.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);
    });

    socket.on(
      "sendMessage",
      async ({ senderId, receiverId, content, type = "text", senderName }) => {
        try {
          if (
            !mongoose.Types.ObjectId.isValid(senderId) ||
            !mongoose.Types.ObjectId.isValid(receiverId)
          ) {
            return;
          }
          const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content,
            type,
          });
          const fullMsg = await Message.findById(message._id).populate(
            "sender",
            "name email"
          );
          const receiverSocket = userSocketMap.get(receiverId);
          if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", {
              ...fullMsg.toObject(),
              senderName:
                senderName || fullMsg.sender.name || fullMsg.sender.email,
            });
          }
        } catch (error) {
          console.error("Socket sendMessage error:", error.message);
        }
      }
    );

    socket.on("callUser", ({ receiverId, signalData, from, roomId }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:user", {
          signal: signalData,
          from,
          roomId,
        });
      }
    });

    socket.on("answerCall", ({ roomId, signal }) => {
      const [user1Id, user2Id] = roomId.split("_");
      const initiatorId = socket.userId === user1Id ? user2Id : user1Id;
      const initiatorSocketId = userSocketMap.get(initiatorId);
      if (initiatorSocketId) {
        io.to(initiatorSocketId).emit("call:accepted", { signal });
      }
    });

    socket.on("endCall", ({ roomId }) => {
      const [user1Id, user2Id] = roomId.split("_");
      const otherUserId = socket.userId === user1Id ? user2Id : user1Id;
      const otherSocketId = userSocketMap.get(otherUserId);
      if (otherSocketId) {
        io.to(otherSocketId).emit("call:ended");
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) userSocketMap.delete(socket.userId);
    });
  });

  return io;
};

export const getSocketIdByUserId = (userId) => userSocketMap.get(userId);
