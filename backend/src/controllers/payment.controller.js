import { prisma } from '../lib/prisma.js';
import { asyncHandler, getPagination, formatPaginatedResponse, AppError } from '../utils/helpers.js';

/**
 * Create payment
 * POST /api/payments
 */
export const createPayment = asyncHandler(async (req, res) => {
    const { bookingId, method, amount, reference } = req.body;
    const userId = req.user.id;

    // Verify booking exists and belongs to user or user is staff
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'FINANCE'].includes(req.user.role);
    if (booking.customerId !== userId && !isStaff) {
        throw new AppError('Access denied', 403);
    }

    // Check if payment amount is valid
    const remainingAmount = parseFloat(booking.totalAmount) - parseFloat(booking.paidAmount);
    if (amount > remainingAmount) {
        throw new AppError(`Payment amount exceeds remaining balance of ${remainingAmount}`, 400);
    }

    // Create payment
    const payment = await prisma.payment.create({
        data: {
            bookingId,
            method,
            amount,
            reference,
            status: method === 'CASH' ? 'PAID' : 'INITIATED', // Auto-confirm cash payments
            ...(method === 'CASH' && { paidAt: new Date() }),
        },
        include: {
            booking: true,
        },
    });

    // If payment is confirmed, update booking
    if (payment.status === 'PAID') {
        const newPaidAmount = parseFloat(booking.paidAmount) + parseFloat(amount);
        const isFullyPaid = newPaidAmount >= parseFloat(booking.totalAmount);

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paidAmount: newPaidAmount,
                ...(isFullyPaid && booking.status === 'PENDING' && { status: 'CONFIRMED' }),
            },
        });
    }

    res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment,
    });
});

/**
 * Get all payments (admin)
 * GET /api/payments
 */
export const getAllPayments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, method, bookingId } = req.query;
    const { skip, take } = getPagination(page, limit);

    const where = {
        ...(status && { status }),
        ...(method && { method }),
        ...(bookingId && { bookingId }),
    };

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take,
            include: {
                booking: {
                    include: {
                        customer: {
                            select: {
                                id: true,
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
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
    ]);

    res.json(formatPaginatedResponse(payments, total, parseInt(page), parseInt(limit)));
});

/**
 * Confirm payment (admin)
 * PUT /api/payments/:id/confirm
 */
export const confirmPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { booking: true },
    });

    if (!payment) {
        throw new AppError('Payment not found', 404);
    }

    if (payment.status === 'PAID') {
        throw new AppError('Payment already confirmed', 400);
    }

    // Update payment status using transaction
    await prisma.$transaction(async (tx) => {
        // Confirm payment
        await tx.payment.update({
            where: { id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        // Update booking paid amount
        const booking = payment.booking;
        const newPaidAmount = parseFloat(booking.paidAmount) + parseFloat(payment.amount);
        const isFullyPaid = newPaidAmount >= parseFloat(booking.totalAmount);

        await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                paidAmount: newPaidAmount,
                ...(isFullyPaid && booking.status === 'PENDING' && { status: 'CONFIRMED' }),
            },
        });
    });

    const updatedPayment = await prisma.payment.findUnique({
        where: { id },
        include: {
            booking: true,
        },
    });

    res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: updatedPayment,
    });
});
