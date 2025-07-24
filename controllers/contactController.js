import User from "../models/User.js";
import mongoose from "mongoose";


export const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const contact = await User.findOne({ email });
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(req.user.id) ||
      req.user.id === String(contact._id)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot add yourself" });
    }

    const result1 = await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { contacts: contact._id } }
    );
    const result2 = await User.updateOne(
      { _id: contact._id },
      { $addToSet: { contacts: req.user.id } }
    );
    if (result1.modifiedCount === 0 || result2.modifiedCount === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to add contact" });
    }
    res.json({ success: true, message: "Contact added" });
  } catch (err) {
    console.error("Add contact error:", err.message); // Log for debugging
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export const getContacts = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(req.user.id).populate(
      "contacts",
      "name email"
    );
    res.json({ success: true, contacts: user.contacts || [] });
  } catch (err) {
    console.error("Get contacts error:", err.message); // Log for debugging
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
