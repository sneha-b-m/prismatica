import Link from "next/link";

import { createLocation } from "@/app/actions/catalog";
import { requireManager } from "@/lib/auth";

export default async function NewLocationPage() {
  await requireManager();
  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create location</h1>

        <p className="mt-2 text-gray-600">
          Add a new inventory location.
        </p>
      </div>

      <form
        action={createLocation}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Code
          </label>

          <input
            id="code"
            name="code"
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
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>

          <textarea
            id="address"
            name="address"
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create location
          </button>

          <Link
            href="/locations"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}