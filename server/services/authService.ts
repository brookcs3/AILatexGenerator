import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

// Use environment variable with fallback for development only
// In production, ensure JWT_SECRET is properly set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'ai-latex-generator-development-secret-key-do-not-use-in-production';
const JWT_EXPIRY = '24h';

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tier: user.subscriptionTier
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch (error) {
    return null;
  }
}
