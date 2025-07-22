import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  startCall,
  answerCall,
  endCall,
} from "../controllers/callController.js";

const router = express.Router();

router.post("/start", verifyToken, startCall);
router.post("/answer", verifyToken, answerCall);
router.post("/end", verifyToken, endCall);

export default router;
