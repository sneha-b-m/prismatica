import {
  addItemNote,
  archiveItem,
  restoreItem,
} from "@/app/actions/catalog";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemDetail } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";

type ItemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ItemDetailPage({
  params,
}: ItemDetailPageProps) {
  const user = await requireUser();
const isManager = user.role === "MANAGER";

  const { id } = await params;

  const item = await getItemDetail(Number(id));

  if (!item) {
    notFound();
  }

  const totalOnHand = item.stockByLocation.reduce(
    (total, stock) => total + stock.quantity,
    0
  );

  return (
    <main>
      <div className="mb-6">
        <Link
          href="/items"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to items
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {item.name}
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Item details and stock history
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isManager && (
  <Link
    href={`/items/${item.id}/edit`}
    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Edit item
  </Link>
)}

            {!item.archived && (
              <Link
                href={`/movements/new?itemId=${item.id}`}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Record movement
              </Link>
            )}

            {isManager && (
  <>
    {item.archived ? (
      <form
        action={restoreItem.bind(
          null,
          item.id
        )}
      >
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Restore
        </button>
      </form>
    ) : (
      <form
        action={archiveItem.bind(
          null,
          item.id
        )}
      >
        <button
          type="submit"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Archive
        </button>
      </form>
    )}
  </>
)}

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                item.archived
                  ? "bg-gray-100 text-gray-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {item.archived
                ? "Archived"
                : "Active"}
            </span>
          </div>
        </div>

        <p className="mt-3 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Archived items are hidden from day-to-day
          movement entry and cannot receive new stock
          movements.
        </p>
      </div>

      {/* Item information */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">
          Item Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              SKU
            </p>
            <p className="mt-1 font-medium">
              {item.sku}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>
            <p className="mt-1 font-medium">
              {item.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category
            </p>
            <p className="mt-1">
              {item.category.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Unit of Measure
            </p>
            <p className="mt-1">
              {item.unitOfMeasure}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Reorder Level
            </p>
            <p className="mt-1">
              {item.reorderLevel}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total on Hand
            </p>
            <p className="mt-1 text-lg font-semibold">
              {totalOnHand}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">
              Description
            </p>
            <p className="mt-1">
              {item.description ||
                "No description available."}
            </p>
          </div>
        </div>
      </section>

      {/* Stock by location */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          Stock by Location
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Location
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Quantity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {item.stockByLocation.map(
                (stock) => (
                  <tr
                    key={stock.location?.id}
                  >
                    <td className="px-4 py-3 text-sm">
                      {stock.location?.name ||
                        "Unknown location"}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium">
                      {stock.quantity}
                    </td>
                  </tr>
                )
              )}

              {item.stockByLocation.length ===
                0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No stock recorded at any
                    location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Movement history */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          Movement History
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Kind
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Quantity
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Location
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Source
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Destination
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Performed By
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Reason / Notes
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {item.movements.map(
                (movement) => (
                  <tr key={movement.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {movement.createdAt.toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      {movement.kind}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {movement.quantity}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {movement.location?.name ||
                        "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {movement.sourceLocation
                        ?.name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {movement
                        .destinationLocation
                        ?.name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {movement.performedBy.name}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {movement.reason ||
                        movement.notes ||
                        "—"}
                    </td>
                  </tr>
                )
              )}

              {item.movements.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No movement history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Item Timeline */}
<section className="mt-6">
  <h2 className="mb-3 text-lg font-semibold">
    Item Timeline
  </h2>

  <form
    action={addItemNote.bind(null, item.id)}
    className="mb-6 rounded-lg border border-gray-200 bg-white p-4"
  >
    <label
      htmlFor="note"
      className="block text-sm font-medium text-gray-700"
    >
      Add note
    </label>

    <textarea
      id="note"
      name="note"
      rows={4}
      required
      placeholder="Enter a note..."
      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    />

    <button
      type="submit"
      className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Add note
    </button>
  </form>

  <div className="space-y-4">
    {item.timelineEvents.map((event) => (
      <div
        key={event.id}
        className="rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">
            {event.eventType}
          </span>

          <span className="text-gray-500">
            {event.createdAt.toLocaleString()}
          </span>

          <span className="text-gray-500">
            by {event.createdBy.name}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-700">
          {event.description}
        </p>

        {event.eventType === "FIELD_CHANGED" && (
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
            <p>
              <span className="font-medium">
                Field:
              </span>{" "}
              {event.fieldName}
            </p>

            <p className="mt-1">
              <span className="font-medium">
                Old value:
              </span>{" "}
              {event.oldValue ?? "—"}
            </p>

            <p className="mt-1">
              <span className="font-medium">
                New value:
              </span>{" "}
              {event.newValue ?? "—"}
            </p>
          </div>
        )}

        {event.eventType === "NOTE" && (
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
            <span className="font-medium">
              Note:
            </span>{" "}
            {event.description}
          </div>
        )}
      </div>
    ))}

    {item.timelineEvents.length === 0 && (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        No timeline events found.
      </div>
    )}
  </div>
</section>
    </main>
  );
}