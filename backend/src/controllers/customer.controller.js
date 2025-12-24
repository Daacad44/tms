import { prisma } from '../lib/prisma.js';
import { asyncHandler, getPagination, formatPaginatedResponse, AppError } from '../utils/helpers.js';

/**
 * Get all customers
 * GET /api/customers
 */
export const getAllCustomers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        role: 'CUSTOMER',
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [customers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                nationality: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    res.json(formatPaginatedResponse(customers, total, parseInt(page), parseInt(limit)));
});

/**
 * Get customer by ID with booking history
 * GET /api/customers/:id
 */
export const getCustomerById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
        where: { id, role: 'CUSTOMER' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            nationality: true,
            passportNo: true,
            dateOfBirth: true,
            status: true,
            createdAt: true,
            bookings: {
                include: {
                    departure: {
                        include: {
                            trip: {
                                include: {
                                    destination: true,
                                },
                            },
                        },
                    },
                    passengers: true,
                    payments: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    // Calculate summary stats
    const stats = await prisma.booking.aggregate({
        where: {
            customerId: id,
            status: 'CONFIRMED',
        },
        _sum: {
            totalAmount: true,
        },
        _count: true,
    });

    res.json({
        success: true,
        data: {
            ...customer,
            stats: {
                totalBookings: stats._count,
                totalSpent: stats._sum.totalAmount || 0,
            },
        },
    });
});
