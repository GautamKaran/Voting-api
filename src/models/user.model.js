import mongoose from "mongoose";

// define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18, // Assuming voting age is 18+
    },
    email: {
      type: String,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["voter", "admin"],
      default: "voter",
    },
    isVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create User model
const User = mongoose.model("User", userSchema);
export default User;
