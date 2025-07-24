import mongoose from "mongoose";
import Message from "../models/Message.js";
import { userSocketMap } from "../websocket/index.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver and message required" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid receiver ID" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    const receiverSocket = userSocketMap.get(receiverId);
    if (receiverSocket) {
      req.io.to(receiverSocket).emit("receiveMessage", {
        ...message._doc,
        sender: req.user.id,
        receiver: receiverId,
      });
    }

    res.status(201).json({ success: true, message: "Message sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: contactId },
        { sender: contactId, receiver: req.user.id },
      ],
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
