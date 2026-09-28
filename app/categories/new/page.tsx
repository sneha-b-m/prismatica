import Link from "next/link";

import { createCategory } from "@/app/actions/catalog";
import { requireManager } from "@/lib/auth";

export default async function NewCategoryPage() {
  await requireManager();
  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create category</h1>

        <p className="mt-2 text-gray-600">
          Add a new inventory category.
        </p>
      </div>

      <form
        action={createCategory}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6"
      >
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
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create category
          </button>

          <Link
            href="/categories"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}