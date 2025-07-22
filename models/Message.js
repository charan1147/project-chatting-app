import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: false },
    type: { type: String, enum: ["text", "video", "audio"], default: "text" },
    callInfo: {
      callType: { type: String, enum: ["video", "audio"] },
      roomId: { type: String },
      startedAt: { type: Date },
      endedAt: { type: Date },
      duration: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
