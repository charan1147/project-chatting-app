import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { sendMessage, getMessages } from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/:contactId", verifyToken, getMessages);

export default router;
