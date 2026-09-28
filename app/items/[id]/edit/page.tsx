import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";
import { getCategoriesForList } from "@/lib/inventory";
import { updateItem } from "@/app/actions/catalog";

type EditItemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditItemPage({
  params,
}: EditItemPageProps) {
  await requireManager();

  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId)) {
    notFound();
  }

  const [item, categories] = await Promise.all([
    prisma.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
        category: true,
      },
    }),
    getCategoriesForList(),
  ]);

  if (!item) {
    notFound();
  }

  const updateItemAction = updateItem.bind(
    null,
    item.id
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Edit item
          </h1>

          <p className="mt-2 text-gray-600">
            Update the details for {item.name}.
          </p>
        </div>

        <Link
          href={`/items/${item.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Cancel
        </Link>
      </div>

      <form
        action={updateItemAction}
        className="mt-6 max-w-2xl space-y-6 rounded-lg border border-gray-200 bg-white p-6"
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
            defaultValue={item.sku}
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
            defaultValue={item.name}
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
            defaultValue={item.description ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="unitOfMeasure"
            className="block text-sm font-medium text-gray-700"
          >
            Unit of Measure
          </label>

          <input
            id="unitOfMeasure"
            name="unitOfMeasure"
            type="text"
            required
            defaultValue={item.unitOfMeasure}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="reorderLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Reorder Level
          </label>

          <input
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={item.reorderLevel}
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
            defaultValue={item.categoryId}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save changes
          </button>

          <Link
            href={`/items/${item.id}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}