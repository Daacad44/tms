export { AppError } from '../middlewares/errorHandler.js';

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Pagination helper
 */
export function getPagination(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    return {
        skip,
        take: limitNum,
        page: pageNum,
        limit: limitNum,
    };
}

/**
 * Format pagination response
 */
export function formatPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Generate slug from title
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

/**
 * Calculate date difference in days
 */
export function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}
