import { prisma } from '../lib/prisma.js';
import { asyncHandler, getPagination, formatPaginatedResponse, AppError } from '../utils/helpers.js';

/**
 * Get all trips with filters and pagination
 * GET /api/trips
 */
export const getTrips = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        category,
        destination,
        minPrice,
        maxPrice,
        startDate,
        search,
        status = 'PUBLISHED',
    } = req.query;

    const { skip, take } = getPagination(page, limit);

    // Build where clause
    const where = {
        status,
        ...(category && { category }),
        ...(destination && { destination: { name: { contains: destination, mode: 'insensitive' } } }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    // Get trips with filters
    const [trips, total] = await Promise.all([
        prisma.trip.findMany({
            where,
            skip,
            take,
            include: {
                destination: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                },
                departures: {
                    where: {
                        status: 'AVAILABLE',
                        startDate: {
                            gte: startDate ? new Date(startDate) : new Date(),
                        },
                        ...(minPrice && { basePrice: { gte: parseFloat(minPrice) } }),
                        ...(maxPrice && { basePrice: { lte: parseFloat(maxPrice) } }),
                    },
                    orderBy: { startDate: 'asc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.trip.count({ where }),
    ]);

    // Format response with min price from departures
    const formattedTrips = trips.map(trip => ({
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        description: trip.description,
        durationDays: trip.durationDays,
        category: trip.category,
        destination: trip.destination,
        image: trip.images[0]?.url || null,
        minPrice: trip.departures[0]?.basePrice || null,
        currency: trip.departures[0]?.currency || 'USD',
        nextDeparture: trip.departures[0]?.startDate || null,
    }));

    res.json(formatPaginatedResponse(formattedTrips, total, parseInt(page), parseInt(limit)));
});

/**
 * Get trip by slug with full details
 * GET /api/trips/:slug
 */
export const getTripBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const trip = await prisma.trip.findUnique({
        where: { slug, status: 'PUBLISHED' },
        include: {
            destination: true,
            images: {
                orderBy: { sortOrder: 'asc' },
            },
            itineraries: {
                orderBy: { dayNo: 'asc' },
            },
            addons: {
                where: { isActive: true },
            },
            departures: {
                where: {
                    status: 'AVAILABLE',
                    startDate: { gte: new Date() },
                },
                orderBy: { startDate: 'asc' },
            },
        },
    });

    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    // Calculate available seats for each departure
    trip.departures = trip.departures.map(dep => ({
        ...dep,
        availableSeats: dep.capacity - dep.seatsReserved
    }));

    res.json({
        success: true,
        data: trip,
    });
});

/**
 * Get departures for a specific trip
 * GET /api/trips/:id/departures
 */
export const getTripDepartures = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate } = req.query;

    const departures = await prisma.tripDeparture.findMany({
        where: {
            tripId: id,
            status: 'AVAILABLE',
            startDate: {
                gte: startDate ? new Date(startDate) : new Date(),
            },
        },
        orderBy: { startDate: 'asc' },
    });

    // Calculate available seats
    const formattedDepartures = departures.map(dep => ({
        ...dep,
        availableSeats: dep.capacity - dep.seatsReserved,
    }));

    res.json({
        success: true,
        data: formattedDepartures,
    });
});
