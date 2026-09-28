import AiSearchBox from "@/app/items/AiSearchBox";
import Link from "next/link";
import { getItemsForList, getCategoriesForList, getLocationsForList } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";

type ItemsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    locationId?: string;
    archived?: "active" | "archived" | "all";
    lowStock?: "true";
    sort?: "name" | "onHand" | "reorderLevel";
    direction?: "asc" | "desc";
    page?: string;
    pageSize?: string;

    ai?: "1";
    aiFallback?: "1";
    aiNotice?: string | string[];
  }>;
};

function buildPageUrl(
  searchParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }

  params.set("page", String(page));

  return `/items?${params.toString()}`;
}

export default async function ItemsPage({
  searchParams,
}: ItemsPageProps) {
  const user = await requireUser();
const isManager = user.role === "MANAGER";

  const params = await searchParams;

  const [
    result,
    categories,
    locations,
  ] = await Promise.all([
    getItemsForList(params),
    getCategoriesForList(),
    getLocationsForList(),
  ]);

  const {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
  } = result;

  const currentSearchParams: Record<
  string,
  string | undefined
> = {
  q: params.q,
  categoryId: params.categoryId,
  locationId: params.locationId,
  archived: params.archived,
  lowStock: params.lowStock,
  sort: params.sort,
  direction: params.direction,
  pageSize: params.pageSize,

  ai: params.ai === "1" ? "1" : undefined,
};

  const previousPageUrl =
    page > 1
      ? buildPageUrl(
          currentSearchParams,
          page - 1
        )
      : null;

  const nextPageUrl =
    page < totalPages
      ? buildPageUrl(
          currentSearchParams,
          page + 1
        )
      : null;

  const interpretedParts: string[] = [];

if (params.q?.trim()) {
  interpretedParts.push(params.q.trim());
}

const categoryId = Number(params.categoryId);

if (Number.isInteger(categoryId) && categoryId > 0) {
  const category = categories.find(
    (item) => item.id === categoryId
  );

  if (category) {
    interpretedParts.push(category.name);
  }
}

const locationId = Number(params.locationId);

if (Number.isInteger(locationId) && locationId > 0) {
  const location = locations.find(
    (item) => item.id === locationId
  );

  if (location) {
    interpretedParts.push(location.name);
  }
}

if (params.lowStock === "true") {
  interpretedParts.push("Low stock");
}

if (params.archived === "archived") {
  interpretedParts.push("Archived");
} else if (params.archived === "active") {
  interpretedParts.push("Active");
}

const aiNotices =
  params.aiNotice === undefined
    ? []
    : Array.isArray(params.aiNotice)
      ? params.aiNotice
      : [params.aiNotice];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Items
          </h1>

          <p className="mt-2 text-gray-600">
            View inventory items and their current
            stock levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
  <Link
    href="/exports/stock-position"
    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Export stock CSV
  </Link>

  {isManager && (
    <Link
      href="/items/new"
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Create item
    </Link>
  )}
</div>
      </div>
      <AiSearchBox
  currentParams={{
    sort: params.sort,
    direction: params.direction,
    pageSize: params.pageSize,
  }}
/>

      {params.ai === "1" && (
  <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-4 py-3">
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-gray-800">
        ✨ Interpreted as:
      </span>

      <span className="text-gray-700">
        {interpretedParts.length > 0
          ? interpretedParts.join(" · ")
          : "current inventory filters"}
      </span>

      <Link
        href="/items"
        className="ml-auto text-sm font-medium text-blue-600 hover:underline"
      >
        Clear
      </Link>
    </div>

    {aiNotices.length > 0 && (
      <div className="mt-2 space-y-1">
        {aiNotices.map((notice, index) => (
          <p
            key={`${notice}-${index}`}
            className="text-sm text-gray-500"
          >
            {notice}
          </p>
        ))}
      </div>
    )}
  </div>
)}

{params.aiFallback === "1" && (
  <p className="mt-3 text-sm text-gray-500">
    AI search unavailable, searched normally instead.
  </p>
)}
      <form
        method="get"
        className="mt-6 rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="q"
              className="block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="Search name or SKU"
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
              defaultValue={params.categoryId ?? ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
              defaultValue={params.locationId ?? ""}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All locations</option>

              {locations.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="archived"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="archived"
              name="archived"
              defaultValue={
                params.archived ?? "active"
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="active">
                Active
              </option>

              <option value="archived">
                Archived
              </option>

              <option value="all">
                All
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700"
            >
              Sort by
            </label>

            <select
              id="sort"
              name="sort"
              defaultValue={
                params.sort ?? "name"
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="name">
                Name
              </option>

              <option value="onHand">
                On-hand quantity
              </option>

              <option value="reorderLevel">
                Reorder level
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="direction"
              className="block text-sm font-medium text-gray-700"
            >
              Direction
            </label>

            <select
              id="direction"
              name="direction"
              defaultValue={
                params.direction ?? "asc"
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="asc">
                Asc
              </option>

              <option value="desc">
                Desc
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="lowStock"
                value="true"
                defaultChecked={
                  params.lowStock === "true"
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              Low-stock only
            </label>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Apply filters
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {totalCount}{" "}
          {totalCount === 1
            ? "match"
            : "matches"}{" "}
          found
        </p>

        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                SKU
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Name
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Category
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Unit of Measure
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Reorder Level
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Total on Hand
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Status
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">
                  {item.sku}
                </td>

                <td className="px-4 py-3 text-sm font-medium">
                  {item.name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.category.name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.unitOfMeasure}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.reorderLevel}
                </td>

                <td className="px-4 py-3 text-sm font-medium">
                  {item.totalOnHand}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.archived
                    ? "Archived"
                    : "Active"}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-3">
                    <Link
                      href={`/items/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>

                    {isManager && (
  <Link
    href={`/items/${item.id}/edit`}
    className="text-blue-600 hover:underline"
  >
    Edit
  </Link>
)}
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        {previousPageUrl ? (
          <Link
            href={previousPageUrl}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-400">
            Previous
          </span>
        )}

        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        {nextPageUrl ? (
          <Link
            href={nextPageUrl}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-400">
            Next
          </span>
        )}
      </div>
    </div>
  );
}