import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { User } from './User';
import { createAppError } from '../../middleware/errorMiddleware';

interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

// @desc    Generate a secure password with the given length
// @route   GET /api/users/generatePassword
// @access  Private (JWT protected)
export const generatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { length } = req.query;
  let parsedLength = Number(length) || 8;
  if (parsedLength < 6) {
    parsedLength = 6;
  }
  const password = generateSecurePassword(parsedLength);
  res.json({ password });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (JWT protected)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, fullName, password } = req.body as CreateUserRequest;
  const usernameExists = await User.existsByUsername(username);
  if (usernameExists) {
    throw createAppError(409, 'User with such username already exists');
  }
  const user = new User(username, email, fullName, password);
  const savedUser = await user.save();
  const userDto = savedUser.toResponse();
  res.status(201).json({ userDto });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (JWT protected)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.findAll();

  // Log raw user instances
  console.log('Fetched Users:', users);

  // Map to DTOs (excluding password)
  const userDtos = users.map((user) => user.toResponse());

  res.status(200).json({ userDtos });
});

// Function to generate a secure password with best practices
const generateSecurePassword = (length: number): string => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomValues = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charSet[randomValues[i] % charSet.length];
  }

  return password;
};
