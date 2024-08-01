import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createNewCandidate } from "../controllers/candidate.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createNewCandidate);

export default router;
