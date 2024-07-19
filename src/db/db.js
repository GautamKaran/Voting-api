import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB_URL = process.env.MONGODB_URL || process.env.mongoDB_local_URL;

    if (!DB_URL) {
      throw Error("MONGODB_URL environment variable is not defined");
    }

    const connectionInstance = await mongoose.connect(`${DB_URL}/Voting-Api`);
    console.log(
      `\nMongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection Failed !!!", error);
    process.exit(1);
  }
};

export default connectDB;
