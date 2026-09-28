# Submission

## Links

- **GitHub repository:** https://github.com/sneha-b-m/inventory-stock-control
- **Live application:** https://inventory-stock-control-hgd3.vercel.app/

## Notes for the reviewer

The application is deployed on Vercel and uses a hosted PostgreSQL database with Prisma ORM.

The demo accounts below are available for review. The Manager account has access to manager-only actions, while Staff accounts are restricted according to their assigned locations and role.

The production database has been migrated and seeded with demo data.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@example.com | password123 |
| Staff | staff1@example.com | password123 |
| Staff | staff2@example.com | password123 |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS | Server-rendered application UI with typed components and responsive styling |
| Backend | Next.js server actions and route handlers | Server-side validation and application workflows |
| Database | PostgreSQL with Prisma ORM | Relational database with typed database access and migrations |
| Hosting | Vercel | Production hosting for the Next.js application |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Manager and Staff accounts are supported with role-based access control. |
| 2 | Items | Done | Items can be created, edited, archived, searched, and viewed with their related information. |
| 3 | Stock movements | Done | Receipts, issues, transfers, and manager-only adjustments are implemented with stock validation. |
| 4 | Stock ledger | Done | Stock movements are recorded in an append-only ledger. |
| 5 | Location assignment | Done | Staff can be assigned to locations and access is restricted accordingly. |
| 6 | Finding items | Done | Server-side search, filtering, sorting, and pagination are implemented. |
| 7 | Bulk import/export | Done | Item CSV import, receipt CSV import, row-level error reporting, and stock position CSV export are implemented. |
| 8 | Dashboard | Done | Dashboard metrics, stock by category/location, and receipt/issue trends are implemented. |
| 9 | History you cannot rewrite | Done | Stock movements are recorded as append-only ledger entries, and item changes/notes are tracked in the timeline. |
| 10 | Low-stock alerts | Done | Low-stock alerts support manager dismissal and reappear when stock recovers and later drops below the threshold again. |

## How much time did you actually spend?

Around 12 hours across 8 sessions.

## What would you do next, with another 12 hours?

I would improve automated test coverage, especially for role enforcement, stock movement edge cases, CSV validation, low-stock alert recovery/reappearance, and ledger integrity.

I would also improve error handling and user feedback for less common failure cases, add more production-level validation, and do a broader accessibility and responsive-design pass.

## What are you least happy with in this codebase, and why?

I am least happy with the amount of manual verification compared with automated test coverage. The main workflows have been tested manually, but more automated tests would make future changes safer, especially around stock calculations, permissions, CSV imports, and the append-only history requirements.