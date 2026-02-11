import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface ApiError {
  message: string;
  code?: string;
}

/**
 * Set CORS headers
 */
export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Send success response
 */
export function sendSuccess(res: VercelResponse, data: any, statusCode = 200) {
  return res.status(statusCode).json(data);
}

/**
 * Send error response
 */
export function sendError(
  res: VercelResponse,
  message: string,
  statusCode = 400,
  code?: string
) {
  return res.status(statusCode).json({
    error: {
      message,
      ...(code && { code }),
    },
  });
}

/**
 * Send validation error
 */
export function sendValidationError(res: VercelResponse, message: string | any) {
  const errorMessage = typeof message === 'string' ? message : message.errors?.[0]?.message || 'Validation failed';
  return sendError(res, errorMessage, 400, 'VALIDATION_ERROR');
}

/**
 * Send unauthorized error
 */
export function sendUnauthorized(res: VercelResponse, message = 'Unauthorized') {
  return sendError(res, message, 401, 'UNAUTHORIZED');
}

/**
 * Send forbidden error
 */
export function sendForbidden(res: VercelResponse, message = 'Forbidden') {
  return sendError(res, message, 403, 'FORBIDDEN');
}

/**
 * Send not found error
 */
export function sendNotFound(res: VercelResponse, message = 'Not found') {
  return sendError(res, message, 404, 'NOT_FOUND');
}

/**
 * Send server error
 */
export function sendServerError(res: VercelResponse, error?: any) {
  console.error('Server error:', error);
  return sendError(
    res,
    error?.message || 'Internal server error',
    500,
    'SERVER_ERROR'
  );
}
