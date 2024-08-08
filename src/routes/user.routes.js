import { Router } from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  getProfile,
  ChangeProfilePassword,
  forgetProfilePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyJWT, logoutUser);

router.route("/profile").get(verifyJWT, getProfile);
router.route("/profile/password").put(verifyJWT, ChangeProfilePassword);
router.route("/profile/forget-password").put(forgetProfilePassword);

export default router;
