import { prisma } from '../lib/prisma.js';
import { asyncHandler, getPagination, formatPaginatedResponse, slugify, AppError } from '../utils/helpers.js';

// ============================================
// TRIPS MANAGEMENT
// ============================================

export const getAllTrips = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, category } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        ...(status && { status }),
        ...(category && { category }),
    };

    const [trips, total] = await Promise.all([
        prisma.trip.findMany({
            where,
            skip,
            take,
            include: {
                destination: true,
                images: { take: 1 },
                _count: {
                    select: { departures: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.trip.count({ where }),
    ]);

    res.json(formatPaginatedResponse(trips, total, parseInt(page), parseInt(limit)));
});

export const createTrip = asyncHandler(async (req, res) => {
    const data = req.body;

    // Generate slug from title
    const slug = slugify(data.title);

    // Check if slug exists
    const existing = await prisma.trip.findUnique({ where: { slug } });
    if (existing) {
        throw new AppError('Trip with similar title already exists', 409);
    }

    const trip = await prisma.trip.create({
        data: {
            ...data,
            slug,
        },
        include: {
            destination: true,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        data: trip,
    });
});

export const updateTrip = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // If title is being updated, regenerate slug
    if (data.title) {
        data.slug = slugify(data.title);
    }

    const trip = await prisma.trip.update({
        where: { id },
        data,
        include: {
            destination: true,
        },
    });

    res.json({
        success: true,
        message: 'Trip updated successfully',
        data: trip,
    });
});

export const deleteTrip = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if trip has bookings
    const bookingsCount = await prisma.booking.count({
        where: {
            departure: {
                tripId: id,
            },
        },
    });

    if (bookingsCount > 0) {
        throw new AppError('Cannot delete trip with existing bookings', 400);
    }

    await prisma.trip.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Trip deleted successfully',
    });
});

// ============================================
// DEPARTURES MANAGEMENT
// ============================================

export const getAllDepartures = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, tripId, status } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        ...(tripId && { tripId }),
        ...(status && { status }),
    };

    const [departures, total] = await Promise.all([
        prisma.tripDeparture.findMany({
            where,
            skip,
            take,
            include: {
                trip: {
                    include: {
                        destination: true,
                    },
                },
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: { startDate: 'desc' },
        }),
        prisma.tripDeparture.count({ where }),
    ]);

    res.json(formatPaginatedResponse(departures, total, parseInt(page), parseInt(limit)));
});

export const createDeparture = asyncHandler(async (req, res) => {
    const data = req.body;

    // Verify trip exists
    const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    const departure = await prisma.tripDeparture.create({
        data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        },
        include: {
            trip: true,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Departure created successfully',
        data: departure,
    });
});

export const updateDeparture = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const departure = await prisma.tripDeparture.update({
        where: { id },
        data,
        include: {
            trip: true,
        },
    });

    res.json({
        success: true,
        message: 'Departure updated successfully',
        data: departure,
    });
});

export const deleteDeparture = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if departure has bookings
    const bookingsCount = await prisma.booking.count({
        where: { departureId: id },
    });

    if (bookingsCount > 0) {
        throw new AppError('Cannot delete departure with existing bookings', 400);
    }

    await prisma.tripDeparture.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Departure deleted successfully',
    });
});

// ============================================
// BOOKINGS MANAGEMENT
// ============================================

export const getAllBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        ...(status && { status }),
        ...(search && {
            OR: [
                { bookingCode: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { email: { contains: search, mode: 'insensitive' } } },
            ],
        }),
    };

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip,
            take,
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
                            },
                        },
                    },
                },
                passengers: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
    ]);

    res.json(formatPaginatedResponse(bookings, total, parseInt(page), parseInt(limit)));
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { passengers: true },
    });

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // If cancelling, release seats
    if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
        await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: { status, cancellationReason },
            }),
            prisma.tripDeparture.update({
                where: { id: booking.departureId },
                data: {
                    seatsReserved: {
                        decrement: booking.passengers.length,
                    },
                },
            }),
        ]);
    } else {
        await prisma.booking.update({
            where: { id },
            data: { status, cancellationReason },
        });
    }

    const updatedBooking = await prisma.booking.findUnique({
        where: { id },
        include: {
            customer: true,
            departure: {
                include: { trip: true },
            },
            passengers: true,
        },
    });

    res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: updatedBooking,
    });
});

// ============================================
// DESTINATIONS
// ============================================

export const getAllDestinations = asyncHandler(async (req, res) => {
    const destinations = await prisma.destination.findMany({
        include: {
            _count: {
                select: { trips: true },
            },
        },
        orderBy: { name: 'asc' },
    });

    res.json({
        success: true,
        data: destinations,
    });
});

export const createDestination = asyncHandler(async (req, res) => {
    const { name, country, city, description, imageUrl } = req.body;

    const destination = await prisma.destination.create({
        data: {
            name,
            country,
            city,
            description,
            imageUrl,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Destination created successfully',
        data: destination,
    });
});

// ============================================
// USERS MANAGEMENT
// ============================================

export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        ...(role && { role }),
        ...(status && { status }),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    res.json(formatPaginatedResponse(users, total, parseInt(page), parseInt(limit)));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });

    res.json({
        success: true,
        message: 'User status updated successfully',
        data: user,
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });

    res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
    });
});
