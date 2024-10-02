import User from "../models/user.model.js";
import { EmailSenderMethod } from "../utils/EmailSenderMedhod.js";
import jwt from "jsonwebtoken";

const genreteAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.genreteRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "Something went wrong while generating refesh and access token "
    );
  }
};

const signupUser = async (req, res) => {
  /**
   * ____________________________________
   *                                    *
   *        User Signup Algorithm       *
   * ___________________________________*
   *
   * step1: Get Data from frontend.
   * step2: Validate all fields are not empty.
   * step3: Check if age is 18+ to be eligible to vote.
   * step4: Validate Aadhar card Number must have exactly 12 digits.
   * step5: Check if user already exists with the same Aadhar Card Number.
   * step6: Check if admin already exists.
   * step7: Create User Object - entry save in db.
   * step8: Remove password and refresh token field from response.
   * step9: Check for user creation success.
   * step10: Return response message: "Signup Successfully".
   *
   */

  try {
    // step1: Get Data from frontend.
    const {
      name,
      age,
      email,
      mobileNumber,
      address,
      aadharCardNumber,
      password,
      role = "voter",
    } = req.body;

    // step2: Validate all fields are not empty.
    if (
      [
        name,
        age,
        email,
        mobileNumber,
        address,
        aadharCardNumber,
        password,
        role,
      ].some((field) => !field)
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // step3: Check if age is 18+ to be eligible to vote.
    if (age < 18) {
      return res.status(400).json({ error: "You are not eligible to vote" });
    }

    // step4: Validate Aadhar card Number must have exactly 12 digits.
    if (!/^\d{12}$/.test(aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // step5: Check if user already exists with the same Aadhar Card Number.
    const existingUser = await User.findOne({ aadharCardNumber });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same Aadhar Card Number already exists",
      });
    }

    // step6: Check if admin already exists.
    const adminUser = await User.findOne({ role: "admin" });
    if (role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // step7: Create User Object - entry save in db.
    const newUser = new User({
      name,
      age,
      email: email.toLowerCase(),
      mobileNumber,
      address,
      aadharCardNumber,
      password,
      role,
    });
    const user = await newUser.save();

    // step8: Remove password and refresh token field from response.
    const createdUser = { ...user._doc };
    delete createdUser.password;
    delete createdUser.role;

    // step9: Check for user creation success.
    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user" });
    }

    // step10: Return response message.
    res.status(201).json({ message: "Signup Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    /**
     * ________________________________________
     *                                         *
     *      User Sign-In Algorithm             *
     * ________________________________________*
     *
     * step1: Get AadharCardNumber and password from frontend.
     * step2: Validate that all fields are not empty.
     * step3: Find the user with AadharCardNumber.
     * step4: Check if the password is correct.
     * step5: Generate Access and refresh token.
     * step6: Send the Access and refresh tokens in the response cookies.
     */

    // step1:  Get AadharCardNumber and password from frontend.
    const { aadharCardNumber, password } = req.body;

    // step2: Validate that all fields are not empty.
    if (!aadharCardNumber || !password) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number and password are required" });
    }

    // step3: Find the user with AadharCardNumber.
    const user = await User.findOne({ aadharCardNumber });

    if (!user) {
      return res.status(404).json({ error: "Invalid Aadhar Card Number" });
    }

    // step4: Check if the password is correct.
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Password !!" });
    }

    // step5: Generate Access and refresh token.
    const { accessToken, refreshToken } = await genreteAccessAndRefreshToken(
      user._id
    );

    const signedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // step6: Send the Access and refresh tokens in the response cookies.
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: 200,
        user: { signedInUser, accessToken, refreshToken },
        message: "User Sing-In Successfully",
      });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  /**
   * ________________________________________
   *                                         *
   *      User Sign-Out Algorithm            *
   * ________________________________________*
   *
   * step 1: verifyJWT middleware provides req.user
   * step 2: Set refreshToken to null for the user in the database
   * step 3: Clear cookies (accessToken and refreshToken), proper message
   *
   */

  try {
    // step 1: verifyJWT middleware provides req.user
    const userId = req.user._id;

    // step 2: Set refreshToken to null for the user in the database
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: null,
        },
      },
      {
        new: true,
      }
    );

    // step 3: Clear cookies (accessToken and refreshToken)
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User SignOut!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Sign-out Failed!", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({ userDetails: user });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const ChangeProfilePassword = async (req, res) => {
  /**
   * ________________________________________
   *                                         *
   *      User ChangePassword Algorithm      *
   * ________________________________________*
   *
   * step 1: verifyJWT middleware provides req.user._id
   * step 2: get oldPassword, newPassword from frontend.
   * step 3: check if oldPassword matches password in database, if not, return an error.
   * step 4: hash newPassword and save it to the database.
   *
   */
  try {
    // step 1: verifyJWT middleware provides req.user._id
    const userID = req.user._id;

    // step 2: get oldPassword, newPassword from frontend.
    const { oldPassword, newPassword } = req.body;

    // Check if both fields are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required!" });
    }

    // Find user by ID and exclude refreshToken
    const user = await User.findById(userID).select("-refreshToken");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // step 3: check if oldPassword matches the password in the database
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // step 4: hash newPassword and save it to the database
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    //  Get refresh token from cookie or header.
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer", "");

    // chack incomingRefreshToken is empty
    if (!incomingRefreshToken) {
      return res.status(401).json({ error: "unauthorized request" });
    }

    // decodedToken with jwt verify
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // ckeck is user by there objectID
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // compair incomingRefreshToken into store db
    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is expired or used" });
    }

    // genreteAccessAndRefreshToken
    const { accessToken, refreshToken } = await genreteAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    // send res
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        accessToken,
        refreshToken: refreshToken,
        message: "Access token refreshed",
      });
  } catch (error) {
    console.error("errror in refreshAccessToken: ", error);
    return res.status(401).json({ error: error?.message });
  }
};

const forgetProfilePassword = async (req, res) => {
  try {
    /**
     * ________________________________________
     *                                         *
     *      User forget-password Algorithm      *
     * ________________________________________*
     *
     * Step1: Get the email for frontend.
     * Step2: check use is exist.
     * Step3: Generate a random OTP (e.g., 6-digit number)
     * Step4: Store the OTP in the database along with an expiration time (e.g., 1 minutes)
     * Step5: Send to email to their OTP
     * Step6: send res
     */

    // Step1: Extract user from req.user.
    const { aadharCardNumber } = req.body;

    if (!aadharCardNumber) {
      return res.status(400).json({ error: "Aadhar Crad Number is required" });
    }

    // Step2: Generate access token.
    const user = await User.findOne({ aadharCardNumber });
    if (!user) {
      return res.status(404).json({ error: "Invalid Aadhar Card Number" });
    }

    // Step3: Generate a random OTP (e.g., 6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Step4: Store the OTP in the database along with an expiration time (e.g., 1 minutes)
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 1 * 60 * 1000; // 1 minutes from now
    await user.save();

    // Step5: Send to email to their OTP
    await EmailSenderMethod(
      user.email,
      "forget password",
      `
      <h1>hey ${user.name}!</h1>
      <h2>your OTP is: <b>${otp}</b></h2>
      <p>Thanks!</p>
      `
    );

    // Step6: send res
    res.status(200).json({ message: "Please check your inbox for the email." });
  } catch (error) {
    console.error("Error in forgetPassword:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const reset = async (req, res) => {
  try {
    /**
     * ________________________________________
     *                                         *
     *      User reset Algorithm               *``
     * ________________________________________*
     *
     * Step1: Get aadharCardNumber, otp, newPassword from frontend
     * Step2: Check user is exits by aadhar Card number
     * Step3: Check if OTP is correct and not expired
     * Step4: Update the user's password
     * Step5: send res
     */

    // Step1: Get aadharCardNumber, otp, newPassword from frontend
    const { aadharCardNumber, otp, newPassword } = req.body;

    // Step2: Check user is exits by aadhar Card number
    const user = await User.findOne({ aadharCardNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step3: Check if OTP is correct and not expired
    if (user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Step4: Update the user's password
    user.password = newPassword; // Make sure to hash the password
    user.resetOtp = undefined; // Clear the OTP
    user.resetOtpExpires = undefined;
    await user.save();

    // Step5: send res
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};
export {
  signupUser,
  loginUser,
  logoutUser,
  getProfile,
  ChangeProfilePassword,
  forgetProfilePassword,
  refreshAccessToken,
  reset,
};
