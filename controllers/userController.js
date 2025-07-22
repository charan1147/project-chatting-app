import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    const contact = await User.findOne({ email });
    if (!contact)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (req.user.id === String(contact._id))
      return res
        .status(400)
        .json({ success: false, message: "Cannot add yourself" });

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { contacts: contact._id } }
    );
    await User.updateOne(
      { _id: contact._id },
      { $addToSet: { contacts: req.user.id } }
    );
    res.json({ success: true, message: "Contact added" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "contacts",
      "name email"
    );
    res.json({ success: true, contacts: user.contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
