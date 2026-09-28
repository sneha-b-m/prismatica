import Link from "next/link";
import { getLocationsForList } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";

export default async function LocationsPage() {
  const user = await requireUser();
const isManager = user.role === "MANAGER";

  const locations = await getLocationsForList();

  return (
    <main>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Locations</h1>

          <p className="mt-2 text-gray-600">
            View inventory locations and assigned staff.
          </p>
        </div>

        {isManager && (
  <Link
    href="/locations/new"
    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    Create location
  </Link>
)}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Address
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Assigned Staff
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Created Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-4 py-3 text-sm font-medium">
                  {location.code}
                </td>

                <td className="px-4 py-3 text-sm">
                  {location.name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {location.address || "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {location.assignedStaffCount}
                </td>

                <td className="px-4 py-3 text-sm">
                  {location.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}

            {locations.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No locations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}