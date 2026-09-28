# Inventory & Stock Control

A full-stack inventory and stock-control application built for the Busy Infotech assignment.

The application manages items, categories, locations, stock movements, item history, low-stock alerts, CSV workflows, and dashboard reporting. Stock on hand is derived from the stock movement ledger rather than being manually edited.

## Features

- Email/password authentication
- Manager and warehouse staff roles
- Server-side role enforcement
- Item creation, editing, archiving, and restoring
- Category and location management
- Staff-to-location assignments
- Receipt, issue, transfer, and adjustment movements
- Append-only stock movement ledger
- Prevention of negative stock
- Manager-only stock adjustments with required reasons
- Server-side item search, filtering, sorting, and pagination
- Item change history and notes timeline
- Low-stock alerts with manager dismissal and reappearance after recovery
- Item CSV import with row-level error reporting
- Receipt CSV import with row-level error reporting
- Stock-position CSV export
- Dashboard inventory metrics
- Stock breakdown by category and location
- Eight-week receipt and issue chart

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- `@prisma/adapter-pg`
- Vercel

## Database

The application uses PostgreSQL in production.

Prisma is configured with the PostgreSQL adapter and the database connection is provided through the `DATABASE_URL` environment variable.

The generated Prisma Client is stored in:

`app/generated/prisma`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a `.env` file in the project root and add:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Do not commit `.env` or database credentials to the repository.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Apply migrations

For an existing database:

```bash
npx prisma migrate deploy
```

For local development when creating a new migration:

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npm run db:seed
```

The seed creates demo users and inventory data.

### 6. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

## Demo Accounts

### Manager

- Email: `manager@example.com`
- Password: `password123`

### Warehouse Staff

- Email: `staff1@example.com`
- Password: `password123`

### Warehouse Staff

- Email: `staff2@example.com`
- Password: `password123`

The staff accounts are used to demonstrate location-based permissions.

## Useful Commands

Start the development server:

```bash
npm run dev
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply production migrations:

```bash
npx prisma migrate deploy
```

Seed the database:

```bash
npm run db:seed
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Production Deployment

The application is deployed on Vercel with a hosted PostgreSQL database.

Live application:

https://inventory-stock-control-hgd3.vercel.app/

The production build uses:

```bash
npm run build
```

The build runs Prisma generation before the Next.js production build.

The production database connection is configured through the Vercel `DATABASE_URL` environment variable.

Production migrations are applied with:

```bash
npx prisma migrate deploy
```

The production database has been seeded with demo data for evaluation.

## Project Structure

Key directories include:

- `app/` — Next.js pages, layouts, server actions, and generated Prisma Client
- `lib/` — authentication, Prisma, inventory, stock, dashboard, and other server-side helpers
- `prisma/` — Prisma schema, migrations, and seed script
- `docs/` — architecture, schema, planning, decisions, and AI prompt documentation

## Documentation

The repository includes the assignment documentation required for the project:

- `docs/architecture.md` — application architecture and request paths
- `docs/schema.md` — database schema and constraints
- `docs/plan.md` — development sessions, estimates, and actual work
- `docs/decisions.md` — technical decisions and trade-offs
- `docs/ai-prompts.md` — AI prompts, outputs, and corrections
- `SUBMISSION.md` — submission details, demo credentials, deployment, and assignment checklist

## Limitations

This project was completed within the assignment's approximately 12-hour scope.

The main limitations are:

- Automated test coverage is limited; verification relied mainly on TypeScript checks, production builds, and manual smoke testing.
- There is no real-time WebSocket-based stock synchronization.
- There is no dedicated background job or queue system.
- The application does not include enterprise-scale caching, search infrastructure, or observability.
- Advanced reporting and configurable permission systems are outside the current scope.

These were deliberate scope decisions so that the required inventory, stock-control, history, alert, CSV, dashboard, and deployment functionality could be completed within the available time.