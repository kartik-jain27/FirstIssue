export class AppError extends Error {
  /**
   * Creates an application error with an HTTP status and stable error code.
   * @param {string} message Public error message.
   * @param {number} [statusCode] HTTP status code.
   * @param {string} [code] Stable machine-readable code.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Wraps async route handlers and forwards failures to Express error handling.
 * @param {import('express').RequestHandler} handler Express route handler.
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/**
 * Handles unknown routes with a JSON 404 response.
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Express next callback.
 * @returns {void}
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

/**
 * Emits a consistent JSON error envelope.
 * @param {Error & {statusCode?: number, code?: string}} err Error object.
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} _next Express next callback.
 * @returns {void}
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      code
    }
  });
}
