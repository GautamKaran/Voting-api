import { Router } from "express";
import {
  signupUser,
  singinUser,
  singOutUser,
  getProfile,
  ChangePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signup").post(signupUser);
router.route("/signin").post(singinUser);

// secure route
router.route("/signout").post(verifyJWT, singOutUser);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/changePassword").post(verifyJWT, ChangePassword);

export default router;
