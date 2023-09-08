import mongoose from "mongoose";
import config from "config";

const connectToDB = async () => {
  try {
    await mongoose.connect(config.get<string>("dbUri"));
    console.log("Connected to Database");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectToDB;
