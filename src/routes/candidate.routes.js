import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createNewCandidate,
  updatedCandidate,
  deleteCandidate,
  vote,
  voteCount,
  getAllCandidates,
} from "../controllers/candidate.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createNewCandidate);
router.route("/:candidateID").put(verifyJWT, updatedCandidate);
router.route("/:candidateID").delete(verifyJWT, deleteCandidate);
router.route("/vote/:candidateID").get(verifyJWT, vote);
router.route("/voteCount").get(voteCount);
router.route("/lists").get(getAllCandidates);

export default router;
