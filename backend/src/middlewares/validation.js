import Joi from 'joi';

/**
 * Validation middleware factory
 */
export function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        // Replace body with validated value
        req.body = value;
        next();
    };
}

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    password: Joi.string().min(8).required(),
    nationality: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

// ============================================
// TRIP SCHEMAS
// ============================================

export const createTripSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    destinationId: Joi.string().uuid().required(),
    description: Joi.string().optional(),
    durationDays: Joi.number().integer().min(1).required(),
    category: Joi.string().valid(
        'UMRAH', 'HAJJ', 'DOMESTIC', 'INTERNATIONAL',
        'CITY_TOUR', 'WEEKEND', 'ADVENTURE', 'LUXURY'
    ).required(),
    inclusions: Joi.string().optional(),
    exclusions: Joi.string().optional(),
    highlights: Joi.string().optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED').default('DRAFT'),
});

export const createDepartureSchema = Joi.object({
    tripId: Joi.string().uuid().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    capacity: Joi.number().integer().min(1).required(),
    basePrice: Joi.number().positive().required(),
    childPrice: Joi.number().positive().optional(),
    currency: Joi.string().length(3).default('USD'),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = Joi.object({
    departureId: Joi.string().uuid().required(),
    passengers: Joi.array().min(1).items(
        Joi.object({
            fullName: Joi.string().required(),
            gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
            dateOfBirth: Joi.date().optional(),
            passportNo: Joi.string().optional(),
            nationality: Joi.string().optional(),
            isChild: Joi.boolean().default(false),
        })
    ).required(),
    addons: Joi.array().items(
        Joi.object({
            addonId: Joi.string().uuid().required(),
            quantity: Joi.number().integer().min(1).default(1),
        })
    ).optional(),
    notes: Joi.string().optional(),
});

export const updateBookingStatusSchema = Joi.object({
    status: Joi.string().valid('CONFIRMED', 'CANCELLED', 'COMPLETED').required(),
    cancellationReason: Joi.string().when('status', {
        is: 'CANCELLED',
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createPaymentSchema = Joi.object({
    bookingId: Joi.string().uuid().required(),
    method: Joi.string().valid('CASH', 'EVC', 'ZAAD', 'SAHAL', 'CARD', 'BANK_TRANSFER').required(),
    amount: Joi.number().positive().required(),
    reference: Joi.string().optional(),
});
