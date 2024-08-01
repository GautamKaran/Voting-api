import { Router } from "express";
import {
  signupUser,
  singinUser,
  singOutUser,
  getProfile,
  ChangePassword,
  forgetPassword,
  reset,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/signin").post(singinUser);
router.route("/reset/:token").post(reset);

// secure route
router.route("/signout").post(verifyJWT, singOutUser);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/changePassword").post(verifyJWT, ChangePassword);
router.route("/forgetPassword").post(verifyJWT, forgetPassword);

export default router;
