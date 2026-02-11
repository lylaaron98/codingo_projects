import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { sendUnauthorized } from '../lib/responses';
import type { Role } from '../models/User';

export interface AuthRequest extends VercelRequest {
  user?: {
    userId: string;
    username: string;
    role: Role;
  };
}

/**
 * Verify JWT token and attach user to request
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthRequest | null> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      sendUnauthorized(res, 'No token provided');
      return null;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
      role: Role;
    };

    (req as AuthRequest).user = decoded;
    return req as AuthRequest;
  } catch (error) {
    sendUnauthorized(res, 'Invalid token');
    return null;
  }
}
