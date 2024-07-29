import connectDB from "./db/db.js";
import { app } from "./app.js";

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
