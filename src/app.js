import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();

// cors setup here
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // form data
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // url data
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import condidateRouter from "./routes/candidate.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/candidate", condidateRouter);

export { app };
