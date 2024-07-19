import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB connection Failed !!!! ", error);
    process.exit(1);
  });
