import { prisma } from '../lib/prisma.js';
import { asyncHandler, getPagination, formatPaginatedResponse, AppError } from '../utils/helpers.js';
import { generateBookingCode } from '../utils/auth.js';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
    const { departureId, passengers, addons, notes } = req.body;
    const userId = req.user.id;

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
        // Get departure details
        const departure = await tx.tripDeparture.findUnique({
            where: { id: departureId },
            include: {
                trip: {
                    include: {
                        addons: true,
                    },
                },
            },
        });

        if (!departure) {
            throw new AppError('Departure not found', 404);
        }

        if (departure.status !== 'AVAILABLE') {
            throw new AppError('This departure is not available for booking', 400);
        }

        // Check capacity
        const availableSeats = departure.capacity - departure.seatsReserved;
        if (availableSeats < passengers.length) {
            throw new AppError(`Only ${availableSeats} seats available`, 400);
        }

        // Calculate total amount
        let totalAmount = 0;

        // Add passenger costs
        passengers.forEach(passenger => {
            if (passenger.isChild && departure.childPrice) {
                totalAmount += parseFloat(departure.childPrice);
            } else {
                totalAmount += parseFloat(departure.basePrice);
            }
        });

        // Add addon costs
        const addonPrices = [];
        if (addons && addons.length > 0) {
            for (const addon of addons) {
                const addonDetails = departure.trip.addons.find(a => a.id === addon.addonId);
                if (!addonDetails) {
                    throw new AppError(`Addon ${addon.addonId} not found`, 404);
                }
                const addonTotal = parseFloat(addonDetails.price) * addon.quantity;
                totalAmount += addonTotal;
                addonPrices.push({
                    addonId: addon.addonId,
                    quantity: addon.quantity,
                    price: addonDetails.price,
                });
            }
        }

        // Create booking
        const booking = await tx.booking.create({
            data: {
                bookingCode: generateBookingCode(),
                customerId: userId,
                departureId,
                status: 'PENDING',
                totalAmount,
                currency: departure.currency,
                notes,
                createdById: userId,
                passengers: {
                    create: passengers.map(p => ({
                        fullName: p.fullName,
                        gender: p.gender,
                        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
                        passportNo: p.passportNo,
                        nationality: p.nationality,
                        isChild: p.isChild || false,
                    })),
                },
                ...(addonPrices.length > 0 && {
                    addons: {
                        create: addonPrices,
                    },
                }),
            },
            include: {
                passengers: true,
                addons: {
                    include: {
                        addon: true,
                    },
                },
                departure: {
                    include: {
                        trip: {
                            include: {
                                destination: true,
                            },
                        },
                    },
                },
            },
        });

        // Update reserved seats
        await tx.tripDeparture.update({
            where: { id: departureId },
            data: {
                seatsReserved: {
                    increment: passengers.length,
                },
            },
        });

        // Update departure status if full
        const newReserved = departure.seatsReserved + passengers.length;
        if (newReserved >= departure.capacity) {
            await tx.tripDeparture.update({
                where: { id: departureId },
                data: { status: 'FULL' },
            });
        }

        return booking;
    });

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: result,
    });
});

/**
 * Get user's bookings
 * GET /api/bookings/my
 */
export const getMyBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const { skip, take } = getPagination(page, limit);

    const where = {
        customerId: userId,
        ...(status && { status }),
    };

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip,
            take,
            include: {
                departure: {
                    include: {
                        trip: {
                            include: {
                                destination: true,
                                images: {
                                    take: 1,
                                    orderBy: { sortOrder: 'asc' },
                                },
                            },
                        },
                    },
                },
                passengers: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
    ]);

    res.json(formatPaginatedResponse(bookings, total, parseInt(page), parseInt(limit)));
});

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            departure: {
                include: {
                    trip: {
                        include: {
                            destination: true,
                            images: true,
                        },
                    },
                },
            },
            passengers: true,
            addons: {
                include: {
                    addon: true,
                },
            },
            payments: true,
        },
    });

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // Check authorization - only owner or staff can view
    if (booking.customerId !== userId && !['ADMIN', 'SUPER_ADMIN', 'AGENT'].includes(userRole)) {
        throw new AppError('Access denied', 403);
    }

    res.json({
        success: true,
        data: booking,
    });
});

/**
 * Cancel booking
 * POST /api/bookings/:id/cancel
 */
export const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            departure: true,
            passengers: true,
        },
    });

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // Check authorization
    if (booking.customerId !== userId && !['ADMIN', 'SUPER_ADMIN', 'AGENT'].includes(userRole)) {
        throw new AppError('Access denied', 403);
    }

    if (booking.status === 'CANCELLED') {
        throw new AppError('Booking already cancelled', 400);
    }

    if (booking.status === 'COMPLETED') {
        throw new AppError('Cannot cancel completed booking', 400);
    }

    // Update booking and release seats
    await prisma.$transaction(async (tx) => {
        await tx.booking.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancellationReason: reason,
            },
        });

        // Release seats
        await tx.tripDeparture.update({
            where: { id: booking.departureId },
            data: {
                seatsReserved: {
                    decrement: booking.passengers.length,
                },
                status: 'AVAILABLE', // Reopen if it was full
            },
        });
    });

    res.json({
        success: true,
        message: 'Booking cancelled successfully',
    });
});
