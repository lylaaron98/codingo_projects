// Response helpers for Express
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

export function sendError(res, message, statusCode = 400, code) {
  return res.status(statusCode).json({
    error: {
      message,
      ...(code && { code }),
    },
  });
}

export function sendValidationError(res, message) {
  const errorMessage = typeof message === 'string' ? message : message.errors?.[0]?.message || 'Validation failed';
  return sendError(res, errorMessage, 400, 'VALIDATION_ERROR');
}

export function sendUnauthorized(res, message = 'Unauthorized') {
  return sendError(res, message, 401, 'UNAUTHORIZED');
}

export function sendForbidden(res, message = 'Forbidden') {
  return sendError(res, message, 403, 'FORBIDDEN');
}

export function sendNotFound(res, message = 'Not found') {
  return sendError(res, message, 404, 'NOT_FOUND');
}

export function sendConflict(res, message = 'Conflict') {
  return sendError(res, message, 409, 'CONFLICT');
}

export function sendServerError(res, error) {
  console.error('Server error:', error);
  return sendError(
    res,
    error?.message || 'Internal server error',
    500,
    'SERVER_ERROR'
  );
}
