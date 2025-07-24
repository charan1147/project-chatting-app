import User from "../models/User.js";
import { generateToken } from "../services/jwtService.js";
import mongoose from "mongoose"; 


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already used" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err.message); 
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Log in a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong email or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message); 
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Log out a user
export const logout = async (req, res) => {
  res.clearCookie("token"); 
  res.status(200).json({ success: true, message: "Logged out" });
};

export const getMe = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Get me error:", err.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
