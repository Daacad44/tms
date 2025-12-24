import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Hash a password
 */
export async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, config.jwtAccessSecret, {
        expiresIn: config.accessTokenExpires,
    });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: config.refreshTokenExpires,
    });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, config.jwtAccessSecret);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, config.jwtRefreshSecret);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Hash refresh token for storage
 */
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate random booking code
 */
export function generateBookingCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BK${timestamp}${random}`;
}
