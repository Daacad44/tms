# Backend Setup Instructions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/tms_db?schema=public"
JWT_ACCESS_SECRET="generate-a-random-secret-key"
JWT_REFRESH_SECRET="generate-another-random-secret-key"
```

**To generate secure secrets, you can use:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Create Database

Create a PostgreSQL database named `tms_db`:

```bash
# Using psql
psql -U postgres
CREATE DATABASE tms_db;
\q
```

Or use a GUI tool like pgAdmin.

## Step 4: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client

## Step 5: Seed Database (Optional)

Populate the database with sample data:

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@tms.com` / `Admin@123`
- Agent user: `agent@tms.com` / `Agent@123`
- Customer user: `customer@example.com` / `Customer@123`
- Sample destinations and trips

## Step 6: Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:4000

## Verify Installation

Test the health endpoint:
```bash
curl http://localhost:4000/health
```

You should see:
```json
{"status":"ok","timestamp":"..."}
```

## Useful Commands

```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Ensure database exists
4. Verify user permissions

### Port Already in Use

If port 4000 is taken, change PORT in .env:
```env
PORT=5000
```

### Prisma Client Not Found

Run:
```bash
npm run prisma:generate
```

## Next Steps

Once the backend is running, proceed to frontend setup.
