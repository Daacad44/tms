# Travel Management System (TMS)

## 🎯 Overview

A comprehensive travel management system for managing trips, bookings, customers, payments, and operations.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh tokens)
- **Security**: bcrypt, helmet, cors

## 📁 Project Structure

```
travel-system/
├── backend/              # Express.js API
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── middlewares/ # Auth, validation, etc.
│   │   ├── utils/       # Helpers
│   │   └── app.js       # Express app
│   └── package.json
└── frontend/            # React + Vite
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── features/    # Feature modules
    │   ├── pages/       # Page components
    │   ├── lib/         # API client, utils
    │   ├── hooks/       # Custom hooks
    │   └── routes/      # Route config
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your DATABASE_URL and secrets in .env
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_BASE_URL in .env
npm run dev
```

## 👥 User Roles

1. **Super Admin** - Full system access
2. **Admin** - Manage trips, bookings, payments, reports
3. **Agent/Staff** - Create/modify bookings, manage customers
4. **Customer** - Browse, book, pay, view history
5. **Finance** - Approve refunds, reconcile payments

## 📦 Core Modules

- ✅ Authentication & Security (JWT + bcrypt)
- ✅ Trips/Packages Management
- ✅ Booking Management
- ✅ Customer Management (CRM)
- ✅ Payment Processing
- ✅ Documents & E-Ticketing
- ✅ Notifications (Email/SMS)
- ✅ Reports & Analytics
- ✅ Admin Settings & Configuration

## 🔐 Security Features

- JWT Access (15min) + Refresh tokens (30 days)
- Token rotation & revocation
- Password hashing with bcrypt
- Rate limiting
- Input validation (Zod)
- CORS & Helmet
- Audit logs

## 📊 Database Schema

Key entities:
- Users, Roles, Permissions
- Destinations, Trips, Departures
- Bookings, Passengers, Add-ons
- Payments, Refunds
- Audit Logs, Settings

## 🌐 API Endpoints

- `/api/auth/*` - Authentication
- `/api/trips/*` - Trip browsing
- `/api/bookings/*` - Booking management
- `/api/admin/*` - Admin operations
- `/api/payments/*` - Payment processing
- `/api/reports/*` - Analytics & reports

## 📄 License

Proprietary - All rights reserved
