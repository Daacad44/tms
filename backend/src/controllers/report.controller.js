import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * Get dashboard summary
 * GET /api/reports/summary
 */
export const getSummary = asyncHandler(async (req, res) => {
    const [
        totalBookings,
        totalRevenue,
        totalCustomers,
        pendingBookings,
        confirmedBookings,
        recentBookings,
    ] = await Promise.all([
        // Total bookings count
        prisma.booking.count(),

        // Total revenue from paid bookings
        prisma.booking.aggregate({
            where: {
                status: {
                    in: ['CONFIRMED', 'COMPLETED'],
                },
            },
            _sum: {
                paidAmount: true,
            },
        }),

        // Total customers
        prisma.user.count({
            where: { role: 'CUSTOMER' },
        }),

        // Pending bookings
        prisma.booking.count({
            where: { status: 'PENDING' },
        }),

        // Confirmed bookings
        prisma.booking.count({
            where: { status: 'CONFIRMED' },
        }),

        // Recent bookings (last 5)
        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                departure: {
                    include: {
                        trip: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    res.json({
        success: true,
        data: {
            totalBookings,
            totalRevenue: totalRevenue._sum.paidAmount || 0,
            totalCustomers,
            pendingBookings,
            confirmedBookings,
            recentBookings,
        },
    });
});

/**
 * Get revenue report
 * GET /api/reports/revenue
 */
export const getRevenue = asyncHandler(async (req, res) => {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = {
        status: {
            in: ['CONFIRMED', 'COMPLETED'],
        },
        ...(startDate && endDate && {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        }),
    };

    const [
        totalRevenue,
        totalBookings,
        paymentsByMethod,
        topTrips,
    ] = await Promise.all([
        // Total revenue
        prisma.booking.aggregate({
            where,
            _sum: {
                paidAmount: true,
                totalAmount: true,
            },
        }),

        // Bookings count
        prisma.booking.count({ where }),

        // Payments by method
        prisma.payment.groupBy({
            by: ['method'],
            where: {
                status: 'PAID',
                ...(startDate && endDate && {
                    paidAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
            },
            _sum: {
                amount: true,
            },
            _count: true,
        }),

        // Top performing trips
        prisma.booking.groupBy({
            by: ['departureId'],
            where,
            _sum: {
                paidAmount: true,
            },
            _count: true,
            orderBy: {
                _sum: {
                    paidAmount: 'desc',
                },
            },
            take: 5,
        }),
    ]);

    // Get trip details for top trips
    const topTripsWithDetails = await Promise.all(
        topTrips.map(async (item) => {
            const departure = await prisma.tripDeparture.findUnique({
                where: { id: item.departureId },
                include: {
                    trip: {
                        include: {
                            destination: true,
                        },
                    },
                },
            });

            return {
                trip: departure?.trip.title,
                destination: departure?.trip.destination.name,
                bookings: item._count,
                revenue: item._sum.paidAmount,
            };
        })
    );

    res.json({
        success: true,
        data: {
            totalRevenue: totalRevenue._sum.paidAmount || 0,
            expectedRevenue: totalRevenue._sum.totalAmount || 0,
            totalBookings,
            paymentsByMethod,
            topTrips: topTripsWithDetails,
        },
    });
});

/**
 * Get bookings funnel report
 * GET /api/reports/bookings
 */
export const getBookingsReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const where = {
        ...(startDate && endDate && {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        }),
    };

    const [
        bookingsByStatus,
        bookingsByCategory,
    ] = await Promise.all([
        // Bookings by status
        prisma.booking.groupBy({
            by: ['status'],
            where,
            _count: true,
        }),

        // Bookings by trip category
        prisma.booking.findMany({
            where,
            include: {
                departure: {
                    include: {
                        trip: {
                            select: {
                                category: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    // Group by category manually
    const categoryGroups = {};
    bookingsByCategory.forEach(booking => {
        const category = booking.departure.trip.category;
        if (!categoryGroups[category]) {
            categoryGroups[category] = 0;
        }
        categoryGroups[category]++;
    });

    res.json({
        success: true,
        data: {
            bookingsByStatus,
            bookingsByCategory: Object.entries(categoryGroups).map(([category, count]) => ({
                category,
                count,
            })),
        },
    });
});
