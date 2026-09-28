import Link from "next/link";
import { getCategoriesForList } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";

export default async function CategoriesPage() {
  const user = await requireUser();
const isManager = user.role === "MANAGER";

  const categories = await getCategoriesForList();

  return (
    <main>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>

          <p className="mt-2 text-gray-600">
            View inventory categories and their items.
          </p>
        </div>

        {isManager && (
  <Link
    href="/categories/new"
    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  >
    Create category
  </Link>
)}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Description
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Number of Items
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 text-sm font-medium">
                  {category.name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {category.description || "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {category.itemCount}
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}