import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    aadharCardNumber: {
      type: Number,
      required: true,
      unqiue: true,
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

// password hash
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// hash password compare with user provided password
userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);

    return isMatch;
  } catch (error) {
    throw new Error("Password comparison failed !!");
  }
};

// Create User model
const User = mongoose.model("User", userSchema);
export default User;
