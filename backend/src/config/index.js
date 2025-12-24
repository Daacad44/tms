import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || '30d',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

    // Email (optional)
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,

    // SMS (optional)
    smsApiKey: process.env.SMS_API_KEY,
    smsSender: process.env.SMS_SENDER,
};

// Validate required config
const requiredConfig = [
    'databaseUrl',
    'jwtAccessSecret',
    'jwtRefreshSecret',
];

requiredConfig.forEach((key) => {
    if (!config[key]) {
        throw new Error(`Missing required config: ${key}`);
    }
});
