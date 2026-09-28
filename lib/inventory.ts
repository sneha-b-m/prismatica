import { prisma } from "./prisma";
import {
  getItemStockByLocation,
} from "./stock";

export type ItemListSearchParams = {
  q?: string;
  categoryId?: string;
  locationId?: string;
  archived?: "active" | "archived" | "all";
  lowStock?: "true";
  sort?: "name" | "onHand" | "reorderLevel";
  direction?: "asc" | "desc";
  page?: string;
  pageSize?: string;
};

export async function getItemsForList(
  params: ItemListSearchParams = {}
) {
  const q = params.q?.trim() || "";

  const categoryId = params.categoryId
    ? Number(params.categoryId)
    : undefined;

  const locationId = params.locationId
    ? Number(params.locationId)
    : undefined;

  const page = Math.max(Number(params.page) || 1, 1);

  const archived =
    params.archived === "archived"
      ? true
      : params.archived === "active"
        ? false
        : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            {
              sku: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              name: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(categoryId !== undefined && !Number.isNaN(categoryId)
      ? {
          categoryId,
        }
      : {}),

    ...(archived !== undefined
      ? {
          archived,
        }
      : {}),
  };

  /*
   * Stock-derived filters and sorting are calculated on the server
   * because stock is derived from StockMovement records.
   */
  const stockDerivedQuery =
    params.lowStock === "true" ||
    (locationId !== undefined &&
      !Number.isNaN(locationId)) ||
    params.sort === "onHand";

  /*
   * Normal database filtering, sorting and pagination.
   */
  if (!stockDerivedQuery) {
    const totalCount = await prisma.item.count({
      where,
    });

    const parsedPageSize = Math.min(
      Math.max(Number(params.pageSize) || 20, 1),
      100
    );

    const totalPages = Math.max(
      Math.ceil(totalCount / parsedPageSize),
      1
    );

    const currentPage = Math.min(page, totalPages);

    const orderBy =
      params.sort === "reorderLevel"
        ? {
            reorderLevel:
              params.direction === "desc"
                ? ("desc" as const)
                : ("asc" as const),
          }
        : {
            name:
              params.direction === "desc"
                ? ("desc" as const)
                : ("asc" as const),
          };

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      skip:
        (currentPage - 1) * parsedPageSize,
      take: parsedPageSize,
    });

    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        const stockByLocationData =
          await getItemStockByLocation(item.id);

        const stockByLocation =
          stockByLocationData.map((stock) => ({
            location: {
              id: stock.locationId,
              name: stock.locationName,
            },
            quantity: stock.quantity,
          }));

        const totalOnHand =
          stockByLocation.reduce(
            (total, stock) =>
              total + stock.quantity,
            0
          );

        return {
          id: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          unitOfMeasure:
            item.unitOfMeasure,
          reorderLevel:
            item.reorderLevel,
          archived: item.archived,
          totalOnHand,
          stockByLocation,
        };
      })
    );

    return {
      items: itemsWithStock,
      totalCount,
      page: currentPage,
      pageSize: parsedPageSize,
      totalPages,
    };
  }

  /*
   * Stock-derived filtering/sorting happens on the server.
   * The browser never receives the complete result for filtering.
   */
  const catalogItems = await prisma.item.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const itemsWithStock = await Promise.all(
    catalogItems.map(async (item) => {
      const stockByLocationData =
        await getItemStockByLocation(item.id);

      const stockByLocation =
        stockByLocationData.map((stock) => ({
          location: {
            id: stock.locationId,
            name: stock.locationName,
          },
          quantity: stock.quantity,
        }));

      const totalOnHand =
        stockByLocation.reduce(
          (total, stock) =>
            total + stock.quantity,
          0
        );

      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unitOfMeasure:
          item.unitOfMeasure,
        reorderLevel:
          item.reorderLevel,
        archived: item.archived,
        totalOnHand,
        stockByLocation,
      };
    })
  );

  let filteredItems = itemsWithStock;

  /*
   * locationId:
   * Keep only items that have non-zero stock
   * at the requested location.
   */
  if (
    locationId !== undefined &&
    !Number.isNaN(locationId)
  ) {
    filteredItems =
      filteredItems.filter((item) => {
        const locationStock =
          item.stockByLocation.find(
            (stock) =>
              stock.location.id === locationId
          );

        return (
          (locationStock?.quantity ?? 0) !== 0
        );
      });
  }

  /*
   * lowStock:
   * Keep items where total stock is less than
   * or equal to the reorder level.
   */
  if (params.lowStock === "true") {
    filteredItems =
      filteredItems.filter(
        (item) =>
          item.totalOnHand <=
          item.reorderLevel
      );
  }

  /*
   * onHand sorting must happen after calculating
   * stock.
   */
  if (params.sort === "onHand") {
    filteredItems.sort((a, b) => {
      const result =
        a.totalOnHand -
        b.totalOnHand;

      return params.direction === "desc"
        ? -result
        : result;
    });
  }

  const totalCount =
    filteredItems.length;

  const parsedPageSize = Math.min(
    Math.max(
      Number(params.pageSize) || 20,
      1
    ),
    100
  );

  const totalPages = Math.max(
    Math.ceil(
      totalCount / parsedPageSize
    ),
    1
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (currentPage - 1) *
    parsedPageSize;

  const paginatedItems =
    filteredItems.slice(
      startIndex,
      startIndex + parsedPageSize
    );

  return {
    items: paginatedItems,
    totalCount,
    page: currentPage,
    pageSize: parsedPageSize,
    totalPages,
  };
}

export async function getItemDetail(
  itemId: number
) {
  const item =
    await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
  category: true,

  stockMovements: {
    include: {
      performedBy: true,
      location: true,
      sourceLocation: true,
      destinationLocation: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },

  timelineEvents: {
    include: {
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
},
    });

  if (!item) {
    return null;
  }

  const stockByLocationData =
    await getItemStockByLocation(itemId);

  const stockByLocation =
    stockByLocationData.map((stock) => ({
      location: {
        id: stock.locationId,
        name: stock.locationName,
      },
      quantity: stock.quantity,
    }));

  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    unitOfMeasure:
      item.unitOfMeasure,
    reorderLevel:
      item.reorderLevel,
    archived: item.archived,
    category: item.category,
    movements: item.stockMovements,
    stockByLocation,
    timelineEvents: item.timelineEvents,
  };
}

export async function getLocationsForList() {
  const locations =
    await prisma.location.findMany({
      include: {
        _count: {
          select: {
            staffAssignments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    code: location.code,
    address: location.address,
    assignedStaffCount:
      location._count
        .staffAssignments,
    createdAt:
      location.createdAt,
  }));
}

export async function getCategoriesForList() {
  const categories =
    await prisma.category.findMany({
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description:
      category.description,
    itemCount:
      category._count.items,
  }));
}