import Link from "next/link";

import { createItem } from "@/app/actions/catalog";
import { getCategoriesForList } from "@/lib/inventory";
import { requireManager } from "@/lib/auth";

export default async function NewItemPage() {
  await requireManager();

  const categories = await getCategoriesForList();

  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create item</h1>
        <p className="mt-2 text-gray-600">
          Add a new inventory item.
        </p>
      </div>

      <form
        action={createItem}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="sku"
            className="block text-sm font-medium text-gray-700"
          >
            SKU
          </label>

          <input
            id="sku"
            name="sku"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="unitOfMeasure"
            className="block text-sm font-medium text-gray-700"
          >
            Unit of measure
          </label>

          <input
            id="unitOfMeasure"
            name="unitOfMeasure"
            type="text"
            placeholder="pcs"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="reorderLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Reorder level
          </label>

          <input
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min="0"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select a category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create item
          </button>

          <Link
            href="/items"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}