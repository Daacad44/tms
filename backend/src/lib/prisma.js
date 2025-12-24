import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Middleware to log slow queries
prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    const duration = after - before;
    if (duration > 1000) {
        console.log(`⚠️  Slow query: ${params.model}.${params.action} took ${duration}ms`);
    }

    return result;
});
