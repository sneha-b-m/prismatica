import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";

export default async function DashboardPage() {
  await requireUser();

  const stats = await getDashboardStats();

  const largestWeeklyValue = Math.max(
    ...stats.weeklyReceiptIssueVolume.flatMap((week) => [
      week.receiptQuantity,
      week.issueQuantity,
    ]),
    1,
  );

  const hasWeeklyActivity = stats.weeklyReceiptIssueVolume.some(
    (week) => week.receiptQuantity > 0 || week.issueQuantity > 0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of inventory and stock activity.
        </p>
      </div>

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/items"
          className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">Active items</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.activeItemsCount}
          </p>
        </Link>

        <Link
          href="/alerts"
          className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">Low-stock items</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.lowStockItemsCount}
          </p>
        </Link>

        <Link
          href="/movements"
          className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">Movements today</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.movementsTodayCount}
          </p>
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">
            Distinct items moved this week
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.distinctItemsMovedThisWeekCount}
          </p>
        </div>
      </div>

      {/* Stock breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            On-hand stock by category
          </h2>

          <div className="mt-4 divide-y divide-gray-100">
            {stats.stockByCategory.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                No category stock yet.
              </p>
            ) : (
              stats.stockByCategory.map((category) => (
                <div
                  key={category.categoryName}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-gray-700">
                    {category.categoryName}
                  </span>
                  <span className="font-medium text-gray-900">
                    {category.totalOnHand}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            On-hand stock by location
          </h2>

          <div className="mt-4 divide-y divide-gray-100">
            {stats.stockByLocation.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                No location stock yet.
              </p>
            ) : (
              stats.stockByLocation.map((location) => (
                <div
                  key={location.locationName}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-gray-700">
                    {location.locationName}
                  </span>
                  <span className="font-medium text-gray-900">
                    {location.totalOnHand}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Weekly receipt/issue chart */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Receipt and issue volume
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stock movement volume over the last eight weeks.
          </p>
        </div>

        {!hasWeeklyActivity ? (
          <p className="py-6 text-sm text-gray-500">
            No receipt or issue activity in the last eight weeks.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {stats.weeklyReceiptIssueVolume.map((week) => (
              <div key={week.weekLabel}>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {week.weekLabel}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-500">
                      Receipt
                    </span>

                    <div className="h-5 flex-1 rounded bg-gray-100">
                      <div
                        className="h-5 rounded bg-blue-500"
                        style={{
                          width: `${
                            (week.receiptQuantity / largestWeeklyValue) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <span className="w-12 text-right text-xs font-medium text-gray-700">
                      {week.receiptQuantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-500">Issue</span>

                    <div className="h-5 flex-1 rounded bg-gray-100">
                      <div
                        className="h-5 rounded bg-red-500"
                        style={{
                          width: `${
                            (week.issueQuantity / largestWeeklyValue) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <span className="w-12 text-right text-xs font-medium text-gray-700">
                      {week.issueQuantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-5 text-xs text-gray-500">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-blue-500" />
            Receipt
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-500" />
            Issue
          </span>
        </div>
      </section>
    </div>
  );
}