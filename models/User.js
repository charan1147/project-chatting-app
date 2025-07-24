import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of contact IDs
  },
  { timestamps: true } 
);


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); // Hash password with bcrypt
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
