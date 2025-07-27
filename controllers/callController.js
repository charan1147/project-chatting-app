import mongoose from "mongoose";
import Message from "../models/Message.js";
import { getSocketIdByUserId, getRoomId } from "../websocket/index.js";

export const startCall = async (req, res) => {
  try {
    const { receiverId, signalData, callType = "video" } = req.body;
    if (!receiverId || !signalData || !["video", "audio"].includes(callType)) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid receiver ID" });
    }

    const roomId = getRoomId(req.user.id, receiverId);
    await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      type: callType,
      callInfo: { callType, roomId, startedAt: new Date() },
    });

    const receiverSocketId = getSocketIdByUserId(receiverId);
    if (!receiverSocketId) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver offline" });
    }

    req.io.to(receiverSocketId).emit("call:user", {
      signal: signalData,
      from: req.user.id,
      roomId,
    });
    res.json({ success: true, message: "Call started" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const answerCall = async (req, res) => {
  try {
    const { roomId, signalData } = req.body;
    if (!roomId || !signalData) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const [user1Id, user2Id] = roomId.split("_");
    const initiatorId = req.user.id === user1Id ? user2Id : user1Id;
    const initiatorSocketId = getSocketIdByUserId(initiatorId);
    if (!initiatorSocketId) {
      return res
        .status(404)
        .json({ success: false, message: "Caller offline" });
    }

    req.io.to(initiatorSocketId).emit("call:accepted", { signal: signalData });
    res.json({ success: true, message: "Call answered" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const endCall = async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing roomId" });
    }

    const callMessage = await Message.findOne({
      "callInfo.roomId": roomId,
      "callInfo.endedAt": { $exists: false },
    });
    if (callMessage) {
      callMessage.callInfo.endedAt = new Date();
      callMessage.callInfo.duration = Math.round(
        (Date.now() - callMessage.callInfo.startedAt.getTime()) / 1000
      );
      await callMessage.save();
    }

    const [user1Id, user2Id] = roomId.split("_");
    const otherUserId = req.user.id === user1Id ? user2Id : user1Id;
    const otherSocketId = getSocketIdByUserId(otherUserId);
    if (otherSocketId) {
      req.io.to(otherSocketId).emit("call:ended");
    }
    res.json({ success: true, message: "Call ended" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
