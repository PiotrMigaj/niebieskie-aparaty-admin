import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { generateToken } from "../../utils/jwt";
import { createAppError } from "../../middleware/errorMiddleware";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

interface LoginRequest {
  username: string;
  password: string;
}

// @desc    Authenticate admin & return JWT token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginRequest;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken("admin", username);
    res.json({ token });
  } else {
    console.log("Error: from here")
    throw createAppError(401, "Invalid credentials");
  }
});
