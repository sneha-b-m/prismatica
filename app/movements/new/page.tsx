import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getMovementFormOptions } from "@/lib/forms";
import { createStockMovement } from "@/app/actions/movements";

type NewMovementPageProps = {
  searchParams: Promise<{
    itemId?: string;
  }>;
};

export default async function NewMovementPage({
  searchParams,
}: NewMovementPageProps) {
  const user = await requireUser();

  const { activeItems, locations } =
    await getMovementFormOptions(user);

  const { itemId } = await searchParams;

  const selectedItemId =
    itemId && activeItems.some((item) => String(item.id) === itemId)
      ? itemId
      : "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            New Stock Movement
          </h1>

          <p className="mt-2 text-gray-600">
            Record a receipt, issue, transfer, or adjustment.
          </p>
        </div>

        <Link
          href="/movements"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to movements
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <form action={createStockMovement} className="space-y-6">
          {/* Movement kind */}
          <div>
            <label
              htmlFor="kind"
              className="block text-sm font-medium text-gray-700"
            >
              Movement kind
            </label>

            <select
              id="kind"
              name="kind"
              required
              defaultValue="RECEIPT"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="RECEIPT">Receipt</option>
              <option value="ISSUE">Issue</option>
              <option value="TRANSFER">Transfer</option>

              {user.role === "MANAGER" && (
                <option value="ADJUSTMENT">Adjustment</option>
              )}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Receipt adds stock, issue removes stock, transfer
              moves stock between locations, and adjustment changes
              stock directly. Adjustments are manager-only.
            </p>
          </div>

          {/* Item */}
          <div>
            <label
              htmlFor="itemId"
              className="block text-sm font-medium text-gray-700"
            >
              Item
            </label>

            <select
              id="itemId"
              name="itemId"
              required
              defaultValue={selectedItemId}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select an item
              </option>

              {activeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Only active, non-archived items are available.
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Receipt, issue, and transfer require a positive
              quantity. Adjustment may be positive or negative,
              but cannot be zero.
            </p>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="locationId"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <select
              id="locationId"
              name="locationId"
              defaultValue=""
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Not used for transfer
              </option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Used for receipt, issue, and adjustment.
            </p>
          </div>

          {/* Source location */}
          <div>
            <label
              htmlFor="sourceLocationId"
              className="block text-sm font-medium text-gray-700"
            >
              Source location
            </label>

            <select
              id="sourceLocationId"
              name="sourceLocationId"
              defaultValue=""
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Not used unless this is a transfer
              </option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Required for transfers. Stock is removed from this
              location.
            </p>
          </div>

          {/* Destination location */}
          <div>
            <label
              htmlFor="destinationLocationId"
              className="block text-sm font-medium text-gray-700"
            >
              Destination location
            </label>

            <select
              id="destinationLocationId"
              name="destinationLocationId"
              defaultValue=""
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Not used unless this is a transfer
              </option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Required for transfers. Stock is added to this
              location.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason
            </label>

            <textarea
              id="reason"
              name="reason"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Required for adjustments. Optional for other
              movement types.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Optional additional information about the movement.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create movement
            </button>

            <Link
              href="/movements"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}