# Plan

## Session 1 - Project foundation

**Goal:** Get a working application skeleton in place so future sessions can focus on inventory behavior instead of setup.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Created the Next.js application with TypeScript and Tailwind CSS.
* Added Prisma as the ORM.
* Configured a local SQLite database for development.
* Created the initial database schema for users, roles, items, categories, locations, staff-location assignments, stock movements, item timeline events, and low-stock alert dismissals.
* Added seed data with demo manager and staff users.
* Created the basic app layout and navigation.
* Added placeholder pages for dashboard, items, locations, movements, users/assignments, and login.
* Added initial helper files for database access and future authentication/permission checks.

**Why I started here:**

I started with the app foundation and data model because the rest of the assignment depends on the stock ledger and role/location relationships. Having the schema, seed data, and route structure in place first should make later sessions more focused and reduce the chance of rewriting large parts of the app.

**What I deliberately left for later:**

* Full login/session handling.
* Real manager/staff permission enforcement.
* Item create/edit/archive forms.
* Stock movement creation.
* Derived stock calculations.
* Server-side search, filters, sorting, and pagination.
* CSV import/export.
* Dashboard metrics and charts.
* Item timeline behavior.
* Low-stock alert dismissal and reappearance logic.
* Deployment.

## Session 2 - Inventory catalog

**Goal:** Connect the inventory catalog to real database data and add basic catalog management.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Connected the item, location, and category pages to real database data.
* Added derived stock totals from stock movement records.
* Added item detail pages with stock by location and movement history.
* Added forms for creating items, categories, and locations.
* Added archive and restore actions for items.

## Session 3 - Authentication and permissions

**Goal:** Make authentication, roles, and location-based permissions real on the server.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Implemented login and logout using server actions.
* Added database-backed sessions using the `UserSession` table.
* Stored the session token in an HTTP-only cookie while storing only its hash in the database.
* Added `requireUser()` and `requireManager()` for protected pages and server actions.
* Protected authenticated pages and made catalog creation/actions manager-only.
* Added the current user's name and role to the application header.
* Added the manager-only Users & Assignments page with real users and assigned locations.
* Added staff-to-location assignment and removal actions with server-side manager checks.
* Added location-specific permission helpers for future stock movement restrictions.

**Why I built this now:**

I needed real authentication and server-side permission enforcement before implementing stock movements. This ensures that role and location rules are enforced on the server rather than only being hidden in the UI.

## Session 4 - Stock movement ledger

**Goal:** Build the core stock system.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Added receipt, issue, transfer, and adjustment stock movements.
* Made movement creation append-only so existing movement records are not edited.
* Added derived stock calculation helpers that calculate on-hand stock from movement records.
* Added negative-stock prevention for issues, transfers, and negative adjustments.
* Blocked new movements for archived items.
* Required a reason for stock adjustments.
* Added staff location access checks so staff can only record movements for their assigned locations.
* Added a real stock movement ledger page and movement creation form.

**Why I built this now:**

I implemented the stock movement ledger after authentication and permissions so every movement can be tied to the current user and checked against their location access. Keeping movements as the source of truth also allows stock to be calculated consistently by location.

## Session 5 - Search and item history

**Goal:** Make the inventory easier to search, edit, and audit.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Added server-side item search by SKU and name.
* Added category, location, archived-status, and low-stock filters.
* Added server-side sorting and pagination.
* Added manager-only item editing with validation.
* Added field-change timeline events for item updates.
* Added item notes that can be created by managers and staff.
* Added an append-only item timeline to the item detail page.
* Added timeline display with dates, event types, users, descriptions, and old/new values for field changes.
* Added an item note form on the item detail page.

**Why I built this now:**

I wanted the inventory list to remain usable as the catalog grows and the item detail page to provide a clear history of changes and notes. Stock-based filters and sorting are calculated on the server because stock is derived from StockMovement records.

## Session 6 - Low-stock alerts and CSV workflows

**Goal:** Complete the operational workflows for low-stock monitoring and CSV data exchange.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Added a server-side low-stock alert query and navigation badge.
* Added manager-only low-stock alert dismissal.
* Made dismissed alerts reappear after stock recovers above the reorder level and later drops again.
* Added item CSV import with validation.
* Added receipt CSV import.
* Added row-level import success and error reporting.
* Added stock position CSV export derived from stock movements.

**Why I built this now:**

I wanted to complete the main operational workflows around monitoring stock levels and moving inventory data in and out of the application. The alert and export workflows continue to use StockMovement as the source of truth.

## Session 7 - Dashboard and polish

**Goal:** Add management overview and improve usability.

**Planned time:** 1.5 hours

**Actual time:** 1.5 hours

**What I built:**

* Added dashboard headline metrics for active items, low-stock items, movements today, and distinct items moved this week.
* Added on-hand stock breakdowns by category and location.
* Added an eight-week receipt and issue volume chart using a simple server-rendered CSS bar chart.
* Added an `ITEM_CREATED` timeline event for items imported from CSV.
* Updated category and location creation to store optional descriptions and addresses.
* Cleaned up navigation so manager-only Users / Assignments and Imports links are only visible to managers.
* Improved dashboard empty states.
* Manually checked the dashboard, CSV import timeline behavior, category/location creation, and role-based navigation.

**Why I built this now:**

I wanted to finish the management overview and polish the main workflows before deployment. I kept the dashboard server-rendered and based its values on the existing stock ledger rather than adding another reporting data source.


## Upcoming sessions


### Session 8 - Deployment and submission

**Goal:** Prepare the final submission.

Planned work:

* Deploy the database and application.
* Seed production demo data.
* Add live app URL and GitHub URL to `SUBMISSION.md`.
* Add demo credentials.
* Finish architecture, schema, decisions, and AI prompt documentation.
* Do final manual testing from the deployed URL.
