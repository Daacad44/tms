/**
 * Custom error class
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
export default function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Prisma errors
    if (err.code === 'P2002') {
        statusCode = 409;
        message = `${err.meta?.target?.[0] || 'Field'} already exists`;
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    } else if (err.code?.startsWith('P')) {
        statusCode = 400;
        message = 'Database operation failed';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err,
        }),
    });
}
