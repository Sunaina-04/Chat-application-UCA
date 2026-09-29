import { logger } from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found - ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  logger.error(`[Error] ${err.message}`, err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
