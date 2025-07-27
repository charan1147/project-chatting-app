import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startCall,
  answerCall,
  endCall,
} from "../controllers/callController.js";

const router = express.Router();

router.post("/start", protect, startCall);
router.post("/answer", protect, answerCall);
router.post("/end", protect, endCall);

export default router;
