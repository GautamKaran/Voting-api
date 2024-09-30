import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import YAML from "yaml";
import { fileURLToPath } from "url";
import fs from "fs";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(
  file?.replace(
    "- url: ${{server}}",
    `- url: ${process.env.VOTING_API_HOST_URL || "http://localhost:8080"}/api/v1`
  )
);

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

// for swagger docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep all the sections collapsed by default
    },
    customSiteTitle: "Voting-APIs docs",
  })
);

export { app };
