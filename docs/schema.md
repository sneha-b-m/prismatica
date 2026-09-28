# Database Schema

The initial schema models users, locations, inventory, stock movements, and supporting history.

## Tables

### User

Stores application users.

* `id` — primary key
* `email` — unique user email
* `name` — user's display name
* `passwordHash` — hashed password
* `role` — `MANAGER` or `STAFF`
* timestamp fields — record creation/update information

A user can have multiple staff-location assignments and can perform multiple stock movements and timeline events.

### UserSession

Stores database-backed login sessions for users.

* `id` — primary key
* `tokenHash` — unique SHA-256 hash of the session token
* `userId` — reference to the user
* `expiresAt` — session expiration time
* `createdAt` — session creation timestamp

The `User` to `UserSession` relationship is one-to-many. A user can have multiple active or historical sessions, while each session belongs to one user. Deleting a user also deletes their sessions through the database relationship.

I store the hash of the session token rather than the raw token in the database. The raw token is only given to the user's HTTP-only cookie, while the database stores the hash used to look up and validate the session.

### Location

Represents a warehouse, branch, or other stock location.

* `id` — primary key
* `name` — location name
* `code` — unique location identifier
* `address` — location address
* timestamp fields

A location can have many staff assignments and can be associated with stock movements.

### Category

Groups related inventory items.

* `id` — primary key
* `name` — category name
* `description` — optional description
* timestamp fields

A category can contain many items.

### Item

Represents an inventory item.

* `id` — primary key
* `sku` — unique stock keeping unit
* `name` — item name
* `description` — item description
* `unitOfMeasure` — how the item is measured
* `reorderLevel` — threshold used for low-stock decisions
* `categoryId` — reference to its category
* timestamp fields

Each item belongs to one category and can have many stock movements and timeline events.

### StaffLocationAssignment

Connects staff users to locations.

* `id` — primary key
* `userId` — user reference
* `locationId` — location reference
* timestamp fields

This represents the many-to-many relationship between staff users and locations.

### StockMovement

Records changes to inventory.

* `id` — primary key
* `itemId` — item reference
* `kind` — `RECEIPT`, `ISSUE`, `TRANSFER`, or `ADJUSTMENT`
* `quantity` — movement quantity
* location information
* source and destination locations for transfers
* `performedById` — user who performed the movement
* optional reason/notes
* timestamp fields

A stock movement belongs to an item and a performing user. A transfer can reference both a source and destination location.

The `quantity` value is interpreted according to the movement kind:

* Receipts use positive quantities because they add stock.
* Issues use positive quantities because they remove that amount from stock.
* Transfers use a positive quantity because the same amount is moved from the source to the destination.
* Adjustments may use either a positive or negative quantity. A positive adjustment increases stock and a negative adjustment decreases stock.

There is no `Item.quantity` field. I derive on-hand stock from the `StockMovement` records instead of storing a separate mutable stock balance on the item. This keeps the movement ledger as the source of truth.

A stock movement belongs to an item and a performing user. A transfer uses one movement row containing both the source and destination locations.

### ItemTimelineEvent

Stores append-only events associated with an item.

* `id` — primary key
* `itemId` — item reference
* `createdById` — user who created the event
* `eventType` — type of timeline event
* `description` — event description or note text
* `fieldName` — field that changed for `FIELD_CHANGED` events
* `oldValue` — previous value for `FIELD_CHANGED` events
* `newValue` — new value for `FIELD_CHANGED` events
* `createdAt` — event creation timestamp

`FIELD_CHANGED` events store the changed field in `fieldName` and the previous and new values in `oldValue` and `newValue`.

`NOTE` events store the note text in `description`.

Timeline records are append-only. The application does not provide an edit or delete workflow for timeline events.

An item can have many timeline events, and a user can create many events.

### LowStockAlertDismissal

Stores information about a manager dismissing a low-stock alert.

* `id` — primary key
* `itemId` — item reference
* `dismissedById` — user who dismissed the alert
* `dismissedAt` — dismissal timestamp

A dismissal does not permanently disable the alert. The alert is hidden only while the item remains at or below its reorder level after the dismissal.

If stock later recovers above the reorder level, the dismissal is considered recovered. If the item's stock subsequently drops to or below the reorder level again, the low-stock alert becomes visible again.

This behavior is calculated from the stock movement ledger and the dismissal timestamp rather than storing a permanent alert status.

## Relationships

The main relationships are:

```text
Category 1 ──────── * Item

User 1 ──────────── * StaffLocationAssignment * ──────────── 1 Location

Item 1 ──────────── * StockMovement

User 1 ──────────── * StockMovement

Item 1 ──────────── * ItemTimelineEvent

User 1 ──────────── * ItemTimelineEvent
```

The staff-to-location relationship is effectively many-to-many through `StaffLocationAssignment`.

Items and users also have one-to-many relationships with stock movements and timeline events.

## Database constraints vs application rules

I use database constraints for facts that must always be true, such as primary keys, required fields, unique email addresses, unique SKUs, foreign-key relationships, and enum values.

I plan to enforce business rules in application/server-side code. Examples include whether a staff member is allowed to access a location, whether an issue would make stock negative, and whether a transfer is valid.

I made this distinction because database constraints are good at protecting structural data integrity, while business permissions and inventory rules depend on the current operation and user context.

## Deliberate denormalisation

I did not deliberately denormalise the core inventory data.

In particular, I have not stored a separate calculated stock total on `Item`. Stock totals are derived in the application query helpers from `StockMovement` rows. This keeps the movement records as the source of truth.

### Server-side stock filtering

The item list's location and low-stock filters, as well as on-hand sorting, currently calculate stock server-side from `StockMovement` rows. The browser does not calculate or receive the complete unfiltered stock result for these operations. This keeps the stock calculation and filtering logic on the server while `StockMovement` remains the source of truth.

`Item.archived` is used to indicate whether an item is active or archived. Creating, archiving, and restoring items also create `ItemTimelineEvent` records with the event types `ITEM_CREATED`, `ITEM_ARCHIVED`, and `ITEM_RESTORED`.

Stock by location is also derived from the movement records. Receipts and adjustments add stock, issues subtract stock, and transfers subtract from the source location and add to the destination location.

### Dashboard data

Dashboard values are calculated from the existing `Item`, `Category`, `Location`, and `StockMovement` tables and the existing stock/alert helpers. I did not add a separate dashboard summary or reporting table.

This keeps `StockMovement` as the source of truth for stock-related dashboard values.


## What would break first at 100x the data?

The first concern would likely be stock and history queries that calculate information by scanning large numbers of stock movements and timeline events.

At a much larger scale, I would need to examine query plans and add appropriate indexes. I might also introduce cached or materialized stock balances if calculating current stock from the complete movement history became too expensive.

The current schema is intentionally designed for the assignment's expected scale rather than premature optimisation.
