# Decisions

## Decision 1

* **Chose:** Next.js with TypeScript and the App Router.
* **Rejected:** Building a separate frontend and backend application.
* **Why:** The assignment needs both UI and server-side functionality, so keeping them in one Next.js application reduces unnecessary project complexity.

## Decision 2

* **Chose:** Prisma with SQLite for local development.
* **Rejected:** Writing SQL/database access directly without an ORM.
* **Why:** Prisma gives me a typed schema, migrations, relationships, and a consistent way to access the database from TypeScript.

## Decision 3

* **Chose:** SQLite for the development database.
* **Rejected:** Starting with a remotely hosted PostgreSQL database.
* **Why:** SQLite makes local development fast and simple. The relational Prisma schema can later be used with PostgreSQL for deployment without changing the overall application architecture.

## Decision 4

* **Chose:** Tailwind CSS with a simple application shell.
* **Rejected:** Introducing a large UI component library during Session 1.
* **Why:** I only needed a professional foundation at this stage. Keeping the styling simple makes the application easier to understand and extend.

## Decision 5

* **Chose:** Placeholder custom authentication and permission helpers.
* **Rejected:** Implementing a complete authentication system during Session 1.
* **Why:** Authentication is an important part of the final application, but implementing it before the foundation was stable would add unnecessary complexity to the first session. I created `lib/auth.ts` and `lib/permissions.ts` so the later implementation has a clear place to go.

## Decision 6

* **Chose:** Prisma 7.10 with the SQLite adapter and the Prisma 7 configuration format.
* **Rejected:** Continuing with the initially installed Prisma 8 release candidate setup.
* **Why:** The initial Prisma installation resolved to a Prisma 8 release candidate and produced configuration incompatibilities with the commands I needed. I changed back to Prisma 7.10, which gave me a stable configuration and working migrations, seeding, and client generation.
* **Later reversed:** Yes. The initial Prisma version choice was changed after the configuration problems became clear.

## Decision 7

* **Chose:** Derive stock totals in application query helpers from `StockMovement` records.
* **Rejected:** Introducing a cached stock balance table at this stage.
* **Why:** The movement records should remain the source of truth. Deriving the current stock avoids maintaining a second mutable balance that could become inconsistent. If performance becomes a problem at a much larger scale, a cached balance can be considered later.

## Decision 8

* **Chose:** A simple custom database-backed session system.
* **Rejected:** Adding a full authentication library.
* **Why:** The assignment only needs email/password authentication, manager and staff roles, and server-side permission enforcement. A custom session implementation keeps the authentication flow small and makes the session and authorization behavior easy to understand and control within the existing Next.js and Prisma architecture.

## Decision 9

* **Chose:** One `StockMovement` row for a transfer with both source and destination locations.
* **Rejected:** Representing a transfer as separate issue and receipt movement rows.
* **Why:** The assignment specifies that a transfer should be a single indivisible operation. Using one movement row keeps the source, destination, and quantity together and makes the transfer easier to audit as one stock movement.

## Decision 10

* **Chose:** Store item notes and field changes in the same `ItemTimelineEvent` table.
* **Rejected:** Creating separate notes and audit/history tables.
* **Why:** The assignment asks for one item timeline containing both notes and changes. Using one append-only timeline table keeps the item history in one chronological place and allows notes and field changes to be displayed together.

## Decision 11

* **Chose:** Calculate low-stock alert visibility from the stock ledger and the dismissal timestamp.
* **Rejected:** Store a permanent dismissed/active alert status.
* **Why:** A dismissed alert must reappear after the item recovers above its reorder level and later drops below the threshold again. Calculating visibility from `StockMovement` records and `LowStockAlertDismissal.dismissedAt` supports this behavior without maintaining another mutable alert state that could become inconsistent with stock.

## Decision 12

* **Chose:** Server-rendered dashboard calculations using the existing inventory and stock movement data.
* **Rejected:** Adding a cached reporting or dashboard summary table.
* **Why:** The assignment dataset is small, so calculating the dashboard values on the server is simple enough and avoids maintaining another source of truth. The stock ledger should remain the source of truth for inventory calculations.
