import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Ensure JWT_SECRET is a string
const JWT_SECRET: string = process.env.JWT_SECRET || 'default_jwt_secret';

// Ensure JWT_EXPIRES_IN is a string (can be '7d', '1h', etc.)
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (id: string, username: string): string => {
  // Ensure you're passing the correct type for `JWT_SECRET`
  // @ts-expect-error - Bypass the TypeScript error for expiresIn
  return jwt.sign(
    { id, username }, // Payload
    JWT_SECRET, // Secret or private key (must be a valid key)
    {
      expiresIn: JWT_EXPIRES_IN, // Valid expiration time (string or number)
    },
  );
};
