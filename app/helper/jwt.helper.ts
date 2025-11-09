const jwt = require("jsonwebtoken");
import dotenv from "dotenv";
dotenv.config();

interface JwtUserPayload {
  userId: string;
  email: string;
  role: string ; 
}

export const generateToken = (user: JwtUserPayload): string => {
  try {
    console.log(" Generating token with:", user);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
  } catch (error) {
    console.error(" Token generation failed:", error);
    throw error;
  }
};

export const verifyToken = (token: string): JwtUserPayload | null => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }
    return jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload;
  } catch (error) {
    console.error(" Token verification failed:", error);
    return null;
  }
};