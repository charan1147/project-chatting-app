import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addContact, getContacts } from "../controllers/contactController.js";

const router = express.Router();

router.post("/add-contact", protect, addContact);
router.get("/contacts", protect, getContacts);

export default router;
