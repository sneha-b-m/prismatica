# AI Prompts

I used AI throughout Session 1 to help me set up the project, create the initial database structure, prepare development data, and establish the application foundation. I checked the generated commands and code in the terminal and corrected issues when they appeared.

## Project foundation

### Prompt

**"I am building an inventory and stock control assignment app. For Session 1, I only want the foundation, not the full app. Use Next.js with TypeScript, Tailwind CSS, Prisma, and SQLite for local development. Please give me exact terminal commands to create the Next.js project, install Prisma and needed dependencies, initialize Prisma with SQLite, and start the dev server."**

### What I got

I received the setup commands for creating a Next.js App Router project, installing Prisma and supporting packages, initializing SQLite, and running the development server.

The Next.js project was created successfully.

### What I corrected

The initial Prisma initialization command used:

`npx prisma init --datasource-provider sqlite`

but my installed Prisma version did not accept that flag. I then ran `npx prisma init` and configured the SQLite datasource separately.

---

## Prisma schema

### Prompt

**"Create an initial Prisma schema for an inventory and stock control app. The app needs users with MANAGER and STAFF roles, locations, categories, items, staff assigned to locations, stock movements with RECEIPT, ISSUE, TRANSFER and ADJUSTMENT kinds, item timeline events, and low stock alert dismissals."**

### What I got

I received an initial relational Prisma schema containing the required models, relationships, enums, unique constraints, and timestamps.

I used this as the foundation for the database and created the initial migration.

### What I corrected

I checked the schema against the assignment requirements and ensured that user email and item SKU were unique, roles and movement kinds used enums, transfers supported source and destination locations, and staff assignments connected users with locations.

---

## Prisma configuration and migration

### Prompt

**"Help me initialize Prisma with SQLite and verify the Prisma configuration and database setup."**

### What I got

Prisma created configuration files and the SQLite schema. A migration was successfully generated and the local `dev.db` database was created.

### What I corrected

The project initially had conflicting Prisma configuration files. Prisma was loading `prisma7.config.ts` instead of the intended `prisma.config.ts`.

I removed the extra configuration and kept the working Prisma 7 configuration with the seed command.

---

## Seed data

### Prompt

**"Write a Prisma seed file for my inventory app. It should create one manager, two staff users, three locations, four categories, eight inventory items, staff-location assignments, and sample stock movements. Use bcryptjs to hash password123 for all demo users. The seed should be safe to rerun by clearing existing data in the correct order."**

### What I got

I received `prisma/seed.ts` containing demo users, locations, categories, items, assignments, and sample stock movements. The seed deletes dependent records first and then recreates the development data.

### What I corrected

I configured the seed command in the Prisma configuration and adjusted the Prisma client setup to match the installed Prisma version and SQLite adapter.

The final seed ran successfully with:

`npx prisma db seed`

and created the complete demo dataset.

---

## Application shell

### Prompt

**"Create a simple Next.js App Router layout for my inventory and stock control app with a top header, left sidebar navigation, links to Dashboard, Items, Locations, Movements, Users/Assignments, a main content area, simple Tailwind styling, and placeholder pages."**

### What I got

I received a simple application shell using the Next.js App Router and Tailwind CSS. It included a sidebar, header, main content area, and placeholder pages for the required routes.

### What I corrected

I kept the implementation intentionally simple for Session 1 and did not add complex components, authentication logic, database calls, or advanced navigation behavior.

---

## Prisma client helper

### Prompt

**"Create a simple Prisma client helper for a Next.js App Router project. I want a file at lib/prisma.ts that exports a singleton PrismaClient suitable for development with hot reload."**

### What I got

I received a global singleton Prisma client pattern for development.

### What I corrected

The first version used `new PrismaClient()` without arguments. My generated Prisma 7 client required the SQLite adapter, so TypeScript reported:

`Expected 1 arguments, but got 0.`

I corrected `lib/prisma.ts` to use `PrismaBetterSqlite3` and pass the adapter to `PrismaClient`.

There was also an accidental Markdown code fence pasted into the TypeScript file. TypeScript reported an error on:

` ```typescript `

I removed the Markdown fence and kept only valid TypeScript code.

After these corrections, `npx tsc --noEmit` passed.

---

## Login page

### Prompt

**"Create a simple login page for my Next.js inventory app. For Session 1, it does not need to fully authenticate yet. It should have an email input, password input, sign in button, and the three demo credentials. Use Tailwind CSS and keep the design simple and professional."**

### What I got

I received a UI-only login page with email and password fields, a sign-in button, and the three demo accounts.

### What I corrected

I deliberately did not connect the form to authentication because full authentication was outside the Session 1 scope.

---

## Authentication and permissions foundation

### Prompt

**"Add placeholder auth helper files for a future custom session implementation. Create lib/auth.ts and lib/permissions.ts. lib/auth.ts should export placeholder functions such as getCurrentUser, requireUser, and requireManager. lib/permissions.ts should define role helper functions and planned permission checks. Do not implement full authentication yet."**

### What I got

I received placeholder authentication functions and role/permission helper functions.

### What I corrected

I kept these as placeholders rather than implementing sessions, cookies, middleware, or database authentication. The permission helpers establish the intended structure for the later authentication and authorization work.

---

## Documentation

### Prompt

**"Update my assignment documentation for Session 1. I need concise entries for plan.md, architecture.md, schema.md, decisions.md, and ai-prompts.md describing what was actually built."**

### What I got

I received draft documentation describing the Session 1 foundation, architecture, schema, technical decisions, and AI-assisted development process.

### What I corrected

I revised the documentation to distinguish between functionality that actually exists and functionality that is only planned. In particular, I did not claim that authentication, server actions, inventory business rules, or production deployment had already been implemented.

I also documented the Prisma configuration/version problems and the corrections made during development.


## Session 2 - Inventory catalog

I used AI during Session 2 to connect the catalog pages to the database, create database query helpers, add catalog forms and actions, and add archive/restore functionality. I checked the generated code with TypeScript and corrected issues when they appeared.

## Inventory query helpers

### Prompt

**"I have a Next.js App Router inventory app using Prisma 7 with the generated client at app/generated/prisma/client and a Prisma helper at lib/prisma.ts. For Session 2, create database query helpers for catalog pages. Create lib/inventory.ts with functions getItemsForList(), getItemDetail(itemId: number), getLocationsForList(), and getCategoriesForList(). Stock should be derived from StockMovement records rather than stored on Item."**

### What I got

I received Prisma helpers for items, item details, locations, and categories. The item detail helper included movement history and calculated stock by location.

### What I corrected

The locations page initially tried to use `staffCount` and `createdAt`, but the helper returned `assignedStaffCount` and did not return `createdAt`. I corrected the page/helper so the returned fields matched the TypeScript types and the required page data.

## Catalog pages

### Prompt

**"Update app/items/page.tsx so it displays real inventory items from the database. Use getItemsForList(). Show SKU, name, category, unit of measure, reorder level, total on hand, archived status, and a link to item detail. Also add a Create item link to /items/new."**

### What I got

I replaced the placeholder items page with a server-rendered table using real database data.

I also created the item detail page using `getItemDetail()` and displayed item information, total stock, stock by location, and movement history.

I connected the locations and categories pages to their database query helpers as well.

## Catalog server actions

### Prompt

**"Create app/actions/catalog.ts with 'use server'. Add createCategory(formData), createLocation(formData), createItem(formData), archiveItem(itemId), and restoreItem(itemId). Use Prisma through lib/prisma.ts. Create the required ItemTimelineEvent records and use a temporary demo manager until authentication is implemented."**

### What I got

I received server actions for creating categories, locations, and items, and for archiving and restoring items. The actions validate the required fields, create timeline events, revalidate relevant paths, and redirect after creation.

### What I corrected

Authentication is not implemented yet, so I kept the demo manager as a temporary solution and added TODO comments stating that Session 3 will replace this with `requireManager()`.

## Catalog creation forms

### Prompt

**"Create app/items/new/page.tsx. It should render a form that posts to createItem from app/actions/catalog.ts. Use getCategoriesForList() for the category dropdown. Also create app/categories/new/page.tsx and app/locations/new/page.tsx with forms connected to createCategory and createLocation."**

### What I got

I received simple server-rendered forms using Tailwind CSS. The item form loads categories from the database for its dropdown, while the category and location forms contain their required fields.

## Archive and restore

### Prompt

**"Update the item detail page to include archive and restore actions. If item.archived is false, show an Archive button. If item.archived is true, show a Restore button. The buttons should call archiveItem(item.id) or restoreItem(item.id) from app/actions/catalog.ts. Add a short note that archived items will be blocked from new stock movements in a later session."**

### What I got

I added server action forms to the item detail page. Active items show an Archive button and archived items show a Restore button. I tested the actions and confirmed that the archived status changes and changes back when restored.

### What I corrected

I initially pasted TypeScript import code into PowerShell by mistake. PowerShell reported that `import` was not recognized as a command. I corrected this by opening the TypeScript file in VS Code and placing the code there instead of entering it in the terminal.


## Session 3 - Authentication and permissions

I used AI during Session 3 to implement authentication, database-backed sessions, server-side authorization, protected pages, and staff-location assignments. I checked the generated code with TypeScript and corrected issues when they appeared.

## Database-backed sessions

**### Prompt**

**"Update the Prisma schema to support database-backed user sessions. Add a UserSession model with a hashed session token, user relationship, expiration time, and creation time. Add the relationship to User."**

**### What I got**

I received the `UserSession` model and the relationship from `User` to `UserSession`.

**### What I corrected**

I also updated the Prisma 7 configuration and ran the migration and client generation commands so the new session model was available to the application.

---

## Authentication helpers

**### Prompt**

**"Implement custom authentication helpers in lib/auth.ts using database-backed sessions. Add login session creation, current-user lookup, requireUser, requireManager, and session destruction. Store the session token in an HTTP-only cookie and store only its hash in the database."**

**### What I got**

I received helpers for creating, validating, and destroying sessions, along with `requireUser()` and `requireManager()`.

**### What I corrected**

I kept the session token in an HTTP-only cookie and used a SHA-256 hash for the database value. I also kept the session duration at seven days and used the existing Prisma client and generated Prisma types.

---

## Login and logout

**### Prompt**

**"Create app/actions/auth.ts with server actions for login and logout. Login should find the user, verify the password with bcrypt, create a database session, and redirect to the dashboard. Invalid credentials should return to the login page with an error."**

**### What I got**

I received server actions for login and logout using bcrypt and the custom session helpers.

**### What I corrected**

I connected the existing login form to the server action and added an invalid-credentials message to the login page instead of leaving the page as a UI-only placeholder.

---

## Protected pages and manager permissions

**### Prompt**

**"Update the application so authenticated pages use requireUser() and manager-only pages and actions use requireManager(). Protect the appropriate inventory, catalog, and users pages. The login page should remain public."**

**### What I got**

I added server-side authentication checks to the protected pages and manager checks to manager-only pages and catalog actions.

**### What I corrected**

I made sure manager-only pages use `requireManager()`, which also checks that the user is authenticated. I also put the authorization checks inside the server actions so staff users cannot bypass the UI restrictions by invoking the actions directly.

---

## Current user in the application header

**### Prompt**

**"Update app/layout.tsx to read the current authenticated user and show their name and role in the header. Show a logout button when signed in and a sign-in link when not signed in."**

**### What I got**

I received a server-rendered header that reads the current session and displays the user's name and role.

**### What I corrected**

I kept the layout server-rendered and connected the logout button to the server logout action.

---

## Location-specific permissions

**### Prompt**

**"Update lib/permissions.ts to add location-specific permission helpers for future stock movements. Managers can access every location, while staff can only access assigned locations. Create canUserAccessLocation(userId, role, locationId) and requireLocationAccess(userId, role, locationId). Use Prisma and keep the existing role helper functions."**

**### What I got**

I received the two location-specific permission helpers. Managers return `true`, while staff users are checked against `StaffLocationAssignment`.

**### What I corrected**

The existing permission helpers needed to remain unchanged, so I added the new Prisma-based location checks without replacing the existing role helpers. `requireLocationAccess()` throws an error when access is denied.

---

## Users and staff-location assignments

**### Prompt**

**"Update app/users/page.tsx to show real users and their location assignments. The page should be manager-only using requireManager(). Show user name, email, role, assigned locations as comma-separated names, and created date. Add a simple manager-only form to assign a staff user to a location, avoid duplicate assignments, revalidate /users, and add a remove assignment action."**

**### What I got**

I received a server-rendered manager page that loads real users, staff users, locations, and assignments from Prisma. It also includes assignment and removal server actions.

**### What I corrected**

The first generated version used the relation name `staffLocationAssignments`, but my Prisma schema uses `locationAssignments`. TypeScript reported that the relation did not exist. I corrected both references to use `locationAssignments`.

After the correction, `npx tsc --noEmit` passed.


**
## Session 4 - Stock movement ledger**

I used AI during Session 4 to implement the stock movement ledger, derived stock calculations, movement validation, and location-based movement permissions. I checked the generated code with TypeScript and tested the movement workflows.

**## Stock calculation helpers**

**### Prompt**

****"Create lib/stock.ts for my inventory app. Stock must be derived from StockMovement records. Add helpers to calculate stock by location, total stock for an item, stock at a specific location, and a helper to prevent an operation from making stock negative. Handle receipts, issues, transfers, and positive or negative adjustments."****

**### What I got**

I received stock calculation helpers that calculate on-hand quantities from movement records and handle the different movement types.

**### What I corrected**

The stock helper returned location fields as `locationId`, `locationName`, and `quantity`, while the existing item detail page expected a nested location object. I adapted the result in `lib/inventory.ts` so the existing page structure continued to work.

**## Stock movement server action**

**### Prompt**

****"Create app/actions/movements.ts with a createStockMovement server action. Support RECEIPT, ISSUE, TRANSFER, and ADJUSTMENT. Require an authenticated user, validate the item and locations, enforce staff location access, prevent negative stock, require a reason for adjustments, block archived items, and create append-only StockMovement records with the current user as performedBy."****

**### What I got**

I received a server action that validates movement data, checks the current user and location permissions, calculates available stock, and creates a new `StockMovement` row.

**### What I corrected**

I made sure receipt, issue, and transfer quantities must be positive, while adjustments can be positive or negative but cannot be zero. I also ensured negative adjustments check available stock before being created.

I kept adjustments manager-only while allowing managers and staff to record receipts, issues, and transfers subject to their location access.

**## Movement form**

**### Prompt**

****"Create app/movements/new/page.tsx for recording stock movements. Include movement type, item, quantity, location, source location, destination location, reason, and notes. Only show active items and only show locations the current user can access."****

**### What I got**

I received a server-rendered movement form connected to `createStockMovement`. The form loads active items and permitted locations from a shared helper.

**### What I corrected**

I added `lib/forms.ts` to keep the form option queries on the server. Managers receive all locations, while staff receive only locations assigned to them.

I also added support for an `itemId` query parameter so the item detail page can open the movement form with the current item already selected.

**## Movement ledger**

**### Prompt**

****"Update app/movements/page.tsx to display real StockMovement records from Prisma. Show the date, item, movement kind, quantity, location, source, destination, performed-by user, and reason/notes. Add a link to record a new movement."****

**### What I got**

I received a server-rendered movement ledger using real database records, ordered with the newest movements first.

**### What I corrected**

I included the related item, location, source location, destination location, and performing user through Prisma relations so the ledger could display meaningful information instead of only IDs.

**## Item movement link**

**### Prompt**

****"Add a Record movement link to the item detail page for active items. Link to /movements/new?itemId=<item id> so the movement form can preselect that item. Do not change the existing archive and restore behavior."****

**### What I got**

I added the Record movement link to active item detail pages and connected it to the movement form.

**### What I corrected**

I kept archived items from showing the movement link and used the `itemId` query parameter only when the item exists in the active-item list. The server action also independently blocks movements for archived items, so the restriction is enforced server-side rather than only through the UI.


## Session 5 - Search and item history

I used AI during Session 5 to implement server-side item search, filtering, sorting, pagination, item editing, field-change timeline events, item notes, and the item timeline display. I checked the generated code with TypeScript and corrected issues when they appeared.

## Search, filtering, sorting, and pagination

### Prompt

**"Update the inventory list to support server-side search and filtering. Add search by SKU/name, category and location filters, archived status, low-stock filtering, sorting by name/on-hand/reorder level, and pagination. Keep stock-derived filtering and sorting on the server."**

### What I got

I received updated inventory query helpers and an item list page that accept search parameters and perform the filtering, sorting, and pagination on the server.

### What I corrected

The first implementation attempted to import `Prisma` from `@prisma/client` for query typing, but my generated Prisma client did not export that member. I removed that dependency and used the existing Prisma types and literal sort directions instead.

## Item editing

### Prompt

**"Create an item edit page for managers. Load the existing item and categories, show SKU, name, description, unit of measure, reorder level, and category fields, and submit the form to updateItem. Add an Edit item link to the item detail page."**

### What I got

I received a manager-only edit page and an Edit item link on the item detail page.

### What I corrected

The edit page initially referenced an `updateItem` server action that did not exist. I added the action to `app/actions/catalog.ts` and kept the existing create, archive, and restore actions working.

## Field-change timeline events

### Prompt

**"Update updateItem(itemId, formData) so it requires a manager, validates the item fields, checks SKU uniqueness and category existence, compares old and new values, updates the item, and creates a FIELD_CHANGED ItemTimelineEvent for each changed field with fieldName, oldValue, newValue, createdById, and a description. Do not create events for unchanged fields."**

### What I got

I received an update action that compares the existing item with the submitted values and creates separate timeline events for changed fields.

The tracked fields are SKU, name, description, unit of measure, reorder level, and category.

### What I corrected

I made sure unchanged fields do not create timeline events. Category changes record the previous and new category values, while numeric reorder-level values are stored as strings in the timeline fields.

## Item notes

### Prompt

**"Add addItemNote(itemId, formData). It should require an authenticated user so both managers and staff can leave notes, validate the item and note, create a NOTE ItemTimelineEvent using the current user, revalidate the item page, and redirect back to the item."**

### What I got

I received an append-only note action that stores the note text in the timeline event description.

### What I corrected

The first TypeScript check reported that `requireUser` could not be found in `catalog.ts`. I corrected the import from `lib/auth` to include both `requireManager` and `requireUser`.

I did not add edit or delete functionality for notes.

## Item timeline display

### Prompt

**"Update getItemDetail(itemId) to load timelineEvents with the createdBy user, event type, description, field name, old value, new value, and createdAt. Order events newest first. Update the item detail page to display the timeline below movement history and add an Add note form."**

### What I got

I updated the item detail query to load timeline events and display them below movement history. The page shows the date, event type, creating user, description, and old/new values for field-change events.

The page also contains a textarea named `note` and an Add note button connected to `addItemNote`.

### What I corrected

I kept the existing movement history, archive/restore behavior, and item editing link unchanged while adding the timeline section.

I also kept the timeline append-only by providing no edit or delete controls.

## Manager-only UI visibility

### Prompt

**"Update the list/detail pages so manager-only links are only shown to managers. Use getCurrentUser() or requireUser() result. Hide Create item, Edit item, Archive/Restore, Create category, and Create location from staff. Keep requireManager() in server actions and pages."**

### What I got

I updated the relevant server-rendered pages to read the current user's role and show manager-only controls only when the role is `MANAGER`.

### What I corrected

I initially needed to adjust the JSX wrapper around the Archive/Restore controls so the conditional rendering was valid JSX. I kept `requireManager()` in the server actions and manager-only edit page because hiding UI controls is not a security boundary.

## Session 5 verification

I used `npx tsc --noEmit` throughout the session to catch TypeScript issues. I also manually checked the expected flows: editing an item should create `FIELD_CHANGED` events containing the old and new values, while adding a note should create a `NOTE` event associated with the current user.


## Session 6 - Low-stock alerts and CSV workflows

I used AI during Session 6 to implement low-stock alerts, alert dismissal and recovery behavior, CSV imports, row-level import reporting, and stock position CSV export. I checked the generated code with TypeScript and corrected issues when they appeared.

## Low-stock alerts

### Prompt

**"Create server-side low-stock alert helpers for my inventory app. Use the existing stock calculation helpers and show active, non-archived items whose total on-hand stock is at or below their reorder level. Support manager dismissal using LowStockAlertDismissal and make dismissed alerts reappear after the item recovers above the reorder level and later becomes low stock again."**

### What I got

I received server-side alert query helpers that calculate current stock from `StockMovement` records and account for the latest dismissal.

### What I corrected

I made the dismissal temporary rather than permanent. The alert is hidden after dismissal until stock recovers above the reorder level. If stock later falls back to the threshold, the alert becomes visible again.

## Alert navigation and dismissal

### Prompt

**"Add a Low-stock Alerts page and navigation badge. Require authentication for the alerts page, show current low-stock items, and allow only managers to dismiss alerts. Keep the dismissal server-side and revalidate the relevant pages."**

### What I got

I received the alerts page, navigation badge, and manager-only dismissal action.

### What I corrected

I kept `requireManager()` inside the dismissal server action so staff cannot bypass the UI restriction.

## Item CSV import

### Prompt

**"Create a manager-only CSV import for inventory items. Parse the CSV with csv-parse, validate each row's SKU, name, unit of measure, reorder level, and category, skip invalid rows, import valid rows, and return row-level success/error results."**

### What I got

I received an item CSV import server action and an import page with row-level results.

### What I corrected

I required existing categories instead of automatically creating categories during import and made duplicate SKUs fail at the individual row level.

## Receipt CSV import

### Prompt

**"Add a manager-only CSV import for stock receipts. Each row should contain SKU, locationCode, quantity, and notes. Validate the item, ensure it is active, validate the location and positive quantity, create a RECEIPT StockMovement for valid rows, and report success or errors for every row."**

### What I got

I received a receipt CSV import that creates append-only `StockMovement` records.

### What I corrected

I made sure archived items cannot receive imported stock and that invalid rows do not prevent other valid rows from being imported.

## CSV parsing

### Prompt

**"Use csv-parse for the CSV import workflows instead of a custom CSV parser. Keep header parsing, BOM handling, empty-row handling, and strict column counts."**

### What I got

I received CSV parsing using `csv-parse/sync`.

### What I corrected

I installed `csv-parse` and replaced the earlier custom parser with the library implementation.

## Stock position CSV export

### Prompt

**"Create app/exports/stock-position/route.ts. This route should export current stock position as CSV. Require an authenticated user, include every item/location stock row, include sku, itemName, category, locationCode, locationName, onHand, reorderLevel, and archived, derive stock from StockMovement using getItemStockByLocation(), and return the file as stock-position.csv."**

### What I got

I received an authenticated CSV download route and added Export stock CSV links to the Items and Stock Movements pages.

### What I corrected

I kept the export derived from `StockMovement` instead of introducing a separate stock balance table. The export includes every location for each item, including zero-stock rows.

## Session 6 verification

I checked the import workflows for row-level validation and confirmed that valid rows can be imported while invalid rows are reported individually. I also checked that the stock position export uses the same movement-derived stock calculation as the application.


## Session 7 - Dashboard and polish

I used AI during Session 7 to build the management dashboard and make several final usability and auditability improvements. I kept the implementation simple and checked the generated changes against the existing Prisma schema and application behavior.

## Dashboard statistics

### Prompt

**"Create lib/dashboard.ts. Add getDashboardStats() that returns activeItemsCount, lowStockItemsCount, movementsTodayCount, distinctItemsMovedThisWeekCount, stockByCategory, stockByLocation, and weeklyReceiptIssueVolume. Stock should be derived from StockMovement records. The weekly chart should cover the last eight weeks including the current week, with transfers and adjustments excluded from receipt/issue volume."**

### What I got

I received a dashboard statistics helper that calculated the requested metrics from Prisma and the existing stock/alert helpers.

### What I corrected

I noticed that the first implementation used the last eight weeks of movements for both the chart and current stock breakdowns. That could undercount current stock if older movements existed. I corrected it so category and location stock use the complete movement history, while only the weekly chart uses the eight-week movement range.

## Weekly dashboard chart

### Prompt

**"Simplify the weekly receipt/issue chart logic. Use JavaScript Date helpers: startOfDay, startOfWeek with Monday as the week start, build an array of 8 week buckets, assign each RECEIPT or ISSUE movement to the correct bucket by createdAt, and label buckets like 'Aug 10'. Keep it TypeScript-safe."**

### What I got

I received a simple bucket-based implementation using JavaScript `Date` helpers instead of adding a chart dependency.

### What I corrected

I kept transfers and adjustments out of the chart and made the bucket calculation use Monday-based weeks. I also kept the chart data separate from the all-time stock calculation.

## Dashboard page

### Prompt

**"Update app/dashboard/page.tsx to show a real inventory dashboard. Use requireUser() from lib/auth.ts and getDashboardStats() from lib/dashboard.ts. Show headline metric cards, stock by category, stock by location, and receipt and issue volume over the last eight weeks. Use a simple Tailwind/CSS bar chart with blue receipt bars and red issue bars. Add links from the low-stock, movements, and active-items cards."**

### What I got

I received a server-rendered dashboard with metric cards, stock breakdowns, navigation links, and a CSS-based receipt/issue chart.

### What I corrected

I kept the dashboard dependency-free and used the existing server-side helpers and Prisma queries. I also added clearer empty states for categories, locations, and weekly activity.

## Dashboard empty states

### Prompt

**"Improve app/dashboard/page.tsx empty states. If stockByCategory is empty, show 'No category stock yet.' If stockByLocation is empty, show 'No location stock yet.' If weekly receipt/issue volume has all zero values, show 'No receipt or issue activity in the last eight weeks.' Keep the page simple."**

### What I got

I received the requested empty-state messages.

### What I corrected

I added a simple check for whether any of the eight weekly buckets contain receipt or issue activity, so the chart is replaced by the requested message when all values are zero.

## CSV import timeline event

### Prompt

**"Update app/actions/imports.ts so importItemsCsv creates an ITEM_CREATED timeline event for each successfully imported item. Use the current manager from requireManager(). After prisma.item.create(), create ItemTimelineEvent with itemId, createdById: manager.id, eventType: 'ITEM_CREATED', description: 'Item imported from CSV'. Keep row-level import behavior unchanged."**

### What I got

I received the timeline event creation after successful item imports.

### What I corrected

I preserved the existing row-level validation and reporting. Timeline events are only created after a successful item creation, so failed rows do not create events.

## Category and location creation

### Prompt

**"Update app/actions/catalog.ts so createCategory stores description from formData when present, createLocation stores address from formData when present, and existing validation, manager checks, and revalidate behavior remain unchanged. Do not change unrelated actions."**

### What I got

I received changes to read the optional description and address values from `formData` and pass them to Prisma.

### What I corrected

I limited the change to `createCategory` and `createLocation`. Existing validation, `requireManager()` calls, revalidation, and unrelated actions were left unchanged.

## Navigation cleanup

### Prompt

**"Update app/layout.tsx so manager-only navigation links are only visible to managers. Manager-only links are Users / Assignments and Imports. Normal authenticated links are Dashboard, Items, Categories, Locations, Movements, and Alerts. Logged-out users should still see a sign-in link. Keep server-side protection in pages/actions unchanged."**

### What I got

I received role-based navigation visibility in the application layout.

### What I corrected

I moved Users / Assignments into the manager-only navigation section alongside Imports. The existing server-side protection was left unchanged, so this is only a UI visibility improvement rather than a replacement for authorization.

## Session 7 documentation and polish

I also cleaned obvious broken Markdown formatting in `docs/plan.md`, `docs/schema.md`, and `docs/decisions.md`, including malformed bold markers, broken headings, stray formatting lines, and inconsistent bullets. I kept the documented meaning unchanged.
