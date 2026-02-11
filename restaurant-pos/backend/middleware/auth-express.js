import jwt from 'jsonwebtoken';
import { sendUnauthorized, sendForbidden } from '../lib/responses-express.js';

/**
 * Express middleware to verify JWT token and attach user to request
 */
export function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendUnauthorized(res, 'Invalid token');
  }
}

/**
 * Express middleware to check if user has required role
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
}
