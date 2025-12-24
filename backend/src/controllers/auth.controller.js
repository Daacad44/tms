import { prisma } from '../lib/prisma.js';
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
} from '../utils/auth.js';
import { AppError, asyncHandler } from '../utils/helpers.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, nationality, dateOfBirth } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
            nationality,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            role: 'CUSTOMER',
            status: 'ACTIVE',
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
        },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user,
            accessToken,
            refreshToken,
        },
    });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
        throw new AppError('Account is not active', 403);
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt,
        },
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            accessToken,
            refreshToken,
        },
    });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    // Find stored token
    const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });

    if (!storedToken) {
        throw new AppError('Invalid refresh token', 401);
    }

    // Check if revoked
    if (storedToken.revokedAt) {
        throw new AppError('Token has been revoked', 401);
    }

    // Check if expired
    if (new Date() > storedToken.expiresAt) {
        throw new AppError('Token has expired', 401);
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const newAccessToken = generateAccessToken({
        userId: storedToken.user.id,
        role: storedToken.user.role,
    });
    const newRefreshToken = generateRefreshToken({ userId: storedToken.user.id });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
        data: {
            userId: storedToken.user.id,
            tokenHash: hashToken(newRefreshToken),
            expiresAt,
        },
    });

    res.json({
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        },
    });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        const tokenHash = hashToken(refreshToken);

        // Revoke refresh token if exists
        await prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    res.json({
        success: true,
        message: 'Logout successful',
    });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            nationality: true,
            dateOfBirth: true,
            createdAt: true,
        },
    });

    res.json({
        success: true,
        data: user,
    });
});
