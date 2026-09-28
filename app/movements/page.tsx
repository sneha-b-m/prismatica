import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MovementsPage() {
  await requireUser();

  const movements = await prisma.stockMovement.findMany({
    include: {
      item: true,
      location: true,
      sourceLocation: true,
      destinationLocation: true,
      performedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Stock Movements
          </h1>

          <p className="mt-2 text-gray-600">
            View receipts, issues, transfers, and adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
  <Link
    href="/exports/stock-position"
    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Export stock CSV
  </Link>

  <Link
    href="/movements/new"
    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    Record movement
  </Link>
</div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Date
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Item
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
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {movement.createdAt.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="font-medium">
                    {movement.item.name}
                  </div>

                  <div className="text-gray-500">
                    {movement.item.sku}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  {movement.kind}
                </td>

                <td className="px-4 py-3 text-sm font-medium">
                  {movement.quantity}
                </td>

                <td className="px-4 py-3 text-sm">
                  {movement.location?.name ?? "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {movement.sourceLocation?.name ?? "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {movement.destinationLocation?.name ?? "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="font-medium">
                    {movement.performedBy.name}
                  </div>

                  <div className="text-gray-500">
                    {movement.performedBy.email}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  {movement.reason || movement.notes ? (
                    <div>
                      {movement.reason && (
                        <div>{movement.reason}</div>
                      )}

                      {movement.notes && (
                        <div className="text-gray-500">
                          {movement.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}

            {movements.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No stock movements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}