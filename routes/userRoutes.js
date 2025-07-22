import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getMe,
  addContact,
  getContacts,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.post("/add-contact", verifyToken, addContact);
router.get("/contacts", verifyToken, getContacts);

export default router;
