import { verifyAccessToken } from '../utils/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export async function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 401);
        }

        if (user.status !== 'ACTIVE') {
            throw new AppError('Account is not active', 403);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }

        next();
    };
}

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
export async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                },
            });

            if (user && user.status === 'ACTIVE') {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail - auth is optional
    }

    next();
}
