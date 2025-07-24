import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  
  addContact,
  getContacts,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/add-contact", verifyToken, addContact);
router.get("/contacts", verifyToken, getContacts);

export default router;
