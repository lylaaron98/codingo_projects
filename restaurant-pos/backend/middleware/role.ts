import type { VercelResponse } from '@vercel/node';
import type { AuthRequest } from './auth';
import { sendForbidden } from '../lib/responses';
import type { Role } from '../models/User';

/**
 * Check if user has required role
 */
export async function requireRole(
  req: AuthRequest,
  res: VercelResponse,
  allowedRoles: Role[]
): Promise<boolean> {
  if (!req.user) {
    sendForbidden(res, 'User not authenticated');
    return false;
  }

  if (!allowedRoles.includes(req.user.role)) {
    sendForbidden(res, 'Insufficient permissions');
    return false;
  }

  return true;
}
