require("dotenv").config();
import mongoose from "mongoose";

const dbUrl: string = process.env.DB_CONN_STRING as string;

export const config = {
  mongodb: async () => {
    try {
      await mongoose.connect(dbUrl);
      console.log("Connected to db");
    } catch (err) {
      console.error("Failed to connect to the db", err);
    }
  },
  bcrypt: {
    saltRounds: parseInt(process.env.SALT_ROUNDS || "10", 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
} as const;
