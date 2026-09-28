# Architecture

## Moving pieces

The application is a Next.js App Router application. The frontend pages and layouts live in the `app/` directory. Tailwind CSS is used for the UI.

Prisma is the ORM and provides access to the SQLite database during local development. The Prisma schema in `prisma/schema.prisma` defines the application's data model, while migrations keep the database structure reproducible.

The `lib/` directory contains shared server-side helpers. `lib/prisma.ts` provides the Prisma client, while `lib/auth.ts` and `lib/permissions.ts` currently provide placeholders for the authentication and authorization system that will be implemented later.

The main planned flow is:

```text
Browser
   ↓
Next.js App Router
   ↓
Server-side actions / routes
   ↓
Authentication + permission checks
   ↓
Prisma
   ↓
Database
```

## Where each piece runs

* **Browser:** renders the Next.js UI and sends requests or form submissions.
* **Next.js:** runs the application and server-side logic.
* **Prisma:** runs on the server and handles database access.
* **SQLite:** runs locally as `dev.db` during development.
* **Future deployed database:** the local database can be replaced with PostgreSQL when the application is deployed.

## Representative request path

A future stock movement is a representative example.

A user will submit a stock movement through the Next.js interface. The request will reach server-side application code, where the current user and their role will be checked. The application will then verify that the user is allowed to perform the operation at the relevant location.

The server-side logic will use Prisma to read the relevant item and location records and create the stock movement. Any related timeline event or low-stock state will also be handled there. The resulting data will then be returned to the Next.js page and displayed to the user.

This complete request path is planned but is not fully implemented in Session 1.

## What I deliberately did not build

I deliberately kept Session 1 as a foundation rather than implementing the full system.

I did not build:

* real authentication or sessions
* authentication middleware
* inventory CRUD operations
* stock calculation and validation logic
* server actions or API routes for business operations
* production database deployment
* complex reusable UI components
* detailed role enforcement

I left these out so that the database foundation, application structure, seed data, and basic navigation could be established and tested before adding business logic.

## Session 2 - Inventory catalog

The catalog pages are server-rendered through the Next.js App Router. They read database data through Prisma helper functions in `lib/inventory.ts`.

I also added server actions for creating categories, locations, and items, and for archiving and restoring items.

Authentication is not implemented yet, so these actions currently use the temporary demo manager for timeline events. I will replace this with `requireManager()` when real authentication and authorization are implemented in Session 3.


## Session 3 - Authentication request path

The authentication flow is handled entirely through server-side Next.js actions and database sessions.

The login request follows this path:

```text
Login form
    ↓
Server action
    ↓
Find user with Prisma
    ↓
bcrypt password check
    ↓
Create UserSession row
    ↓
Set HTTP-only session cookie
    ↓
requireUser / requireManager
    ↓
Protected page or server action
```

When a user logs in, the server action checks the submitted email and password against the stored user record. The password is verified using bcrypt. If the credentials are valid, a random session token is generated and its hash is stored in the `UserSession` table. The raw token is placed in an HTTP-only cookie.

Protected pages call `requireUser()` or `requireManager()` to verify the session and retrieve the current user. Server actions also perform their own permission checks so that protected operations cannot be bypassed by directly invoking the server action.

Manager-only catalog actions and the Users / Assignments functionality therefore enforce authorization on the server.

**

## Session 4 - Stock movement request path**

Recording a stock movement now follows this server-side request path:

```text
Movement form submit
    ↓
createStockMovement server action
    ↓
requireUser / role check
    ↓
Item and location validation
    ↓
Location access check
    ↓
Stock calculation / negative-stock validation
    ↓
Prisma create StockMovement
    ↓
Revalidate movement and inventory pages
    ↓
Redirect to item detail
```

The `createStockMovement` server action first requires an authenticated user and validates the movement type, item, quantity, and relevant locations. It checks staff access to the selected locations and applies manager-only rules for adjustments.

Before creating an issue, transfer, or negative adjustment, the application calculates the current stock and prevents the operation if it would make stock negative. The movement is then stored as a new `StockMovement` row through Prisma.

Stock is not updated directly on the `Item` record. Instead, the movement ledger remains the source of truth, and the stock helpers derive the current quantity from the movement history. After creation, the relevant pages are revalidated so the updated stock and movement history are displayed.

## Session 5 - Item editing request path

Editing an item now follows this server-side request path:

```text
Edit form
    ↓
updateItem server action
    ↓
requireManager
    ↓
Validate fields
    ↓
Load existing item and compare old/new values
    ↓
Update item
    ↓
Create FIELD_CHANGED timeline events
    ↓
Revalidate item and list pages
    ↓
Redirect to item detail
```

The `updateItem` server action requires a manager before performing the operation. It validates the submitted SKU, name, description, unit of measure, reorder level, and category. It checks that the SKU remains unique and that the selected category exists.

The action compares the submitted values with the existing item values. It creates a separate `FIELD_CHANGED` timeline event only for fields that actually changed. The event records the field name, old value, new value, current manager, and timestamp.

The item is then updated through Prisma, the relevant pages are revalidated, and the user is redirected to the item detail page.

Item notes use a separate server action, `addItemNote`, which requires an authenticated user so both managers and staff can add notes. Notes are stored as append-only `NOTE` timeline events.

## Session 6 - Low-stock alerts and CSV workflows

### Dismissing a low-stock alert

```text
Dismiss alert form
    ↓
dismissLowStockAlert server action
    ↓
requireManager
    ↓
Validate item and current low-stock state
    ↓
Create/update LowStockAlertDismissal
    ↓
Revalidate alerts, dashboard, and items
    ↓
Redirect to alerts

### Importing a CSV with per-row validation
CSV upload form
    ↓
Server action
    ↓
requireManager
    ↓
Parse CSV headers and rows
    ↓
Validate each row
    ↓
Create valid database records
    ↓
Collect success/error result for each row
    ↓
Revalidate affected pages
    ↓
Display row-level import report

Exporting stock position CSV

Export stock CSV link
    ↓
GET /exports/stock-position
    ↓
requireUser
    ↓
Load items and locations
    ↓
getItemStockByLocation(itemId)
    ↓
Build CSV rows
    ↓
Return text/csv response
    ↓
Download stock-position.csv

## Dashboard request path

`dashboard page` → `requireUser` → `getDashboardStats` → stock helpers / Prisma queries → server-rendered metrics and chart.

The dashboard checks that the user is authenticated, then calculates its metrics from the existing inventory and stock movement data. Stock values continue to come from `StockMovement` records rather than a separate dashboard data store. The metrics and chart are rendered on the server.
