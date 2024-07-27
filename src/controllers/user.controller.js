import User from "../models/user.model.js";

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

const singinUser = async (req, res) => {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { signupUser, singinUser };
