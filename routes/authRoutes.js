import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  getMe,
} from "../controllers/authController.js";
import { verifyToken } from "../services/jwtService.js";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser); 
router.post("/logout", logout); 
router.get("/me", verifyToken, getMe); 

export default router;
