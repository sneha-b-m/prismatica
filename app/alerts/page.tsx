import Link from "next/link";

import { dismissLowStockAlert } from "@/app/actions/alerts";
import { requireUser } from "@/lib/auth";
import { getLowStockAlerts } from "@/lib/alerts";

export default async function AlertsPage() {
  const user = await requireUser();
  const alerts = await getLowStockAlerts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Low-stock Alerts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Items currently at or below their reorder level.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No low-stock alerts.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Item name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total on hand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Reorder level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {alert.sku}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        href={`/items/${alert.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {alert.name}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {alert.categoryName}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {alert.totalOnHand}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {alert.reorderLevel}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        Low stock
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      {user.role === "MANAGER" ? (
                        <form action={dismissLowStockAlert.bind(null, alert.id)}>
                          <button
                            type="submit"
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Dismiss
                          </button>
                        </form>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Manager only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}