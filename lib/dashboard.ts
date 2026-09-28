import "server-only";

import { prisma } from "@/lib/prisma";
import { getLowStockAlertCount } from "@/lib/alerts";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - daysSinceMonday);

  return result;
}

export async function getDashboardStats() {
  const now = new Date();

  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  const eightWeeksAgo = new Date(weekStart);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 7);

  const [
    activeItemsCount,
    lowStockItemsCount,
    movementsTodayCount,
    distinctItemsMoved,
    allMovements,
    weeklyMovements,
    locations,
  ] = await Promise.all([
    prisma.item.count({
      where: {
        archived: false,
      },
    }),

    getLowStockAlertCount(),

    prisma.stockMovement.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),

    prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: weekStart,
        },
      },
      select: {
        itemId: true,
      },
      distinct: ["itemId"],
    }),

    // All movements are required to calculate current stock.
    prisma.stockMovement.findMany({
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    }),

    // Only the last 8 weeks are needed for the chart.
    prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: eightWeeksAgo,
        },
      },
      select: {
        kind: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.location.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const stockByCategoryMap = new Map<string, number>();
  const stockByLocationMap = new Map<number, number>();

  for (const location of locations) {
    stockByLocationMap.set(location.id, 0);
  }

  // Derive current stock from the complete movement history.
  for (const movement of allMovements) {
    const quantity = movement.quantity;

    switch (movement.kind) {
      case "RECEIPT":
        if (movement.locationId !== null) {
          stockByLocationMap.set(
            movement.locationId,
            (stockByLocationMap.get(movement.locationId) ?? 0) + quantity,
          );
        }

        break;

      case "ISSUE":
        if (movement.locationId !== null) {
          stockByLocationMap.set(
            movement.locationId,
            (stockByLocationMap.get(movement.locationId) ?? 0) - quantity,
          );
        }

        break;

      case "ADJUSTMENT":
        if (movement.locationId !== null) {
          stockByLocationMap.set(
            movement.locationId,
            (stockByLocationMap.get(movement.locationId) ?? 0) + quantity,
          );
        }

        break;

      case "TRANSFER":
        if (movement.sourceLocationId !== null) {
          stockByLocationMap.set(
            movement.sourceLocationId,
            (stockByLocationMap.get(movement.sourceLocationId) ?? 0) -
              quantity,
          );
        }

        if (movement.destinationLocationId !== null) {
          stockByLocationMap.set(
            movement.destinationLocationId,
            (stockByLocationMap.get(movement.destinationLocationId) ?? 0) +
              quantity,
          );
        }

        break;
    }

    // Transfers do not change total stock, so only the other
    // movement kinds affect category totals.
    let categoryChange = 0;

    switch (movement.kind) {
      case "RECEIPT":
      case "ADJUSTMENT":
        categoryChange = quantity;
        break;

      case "ISSUE":
        categoryChange = -quantity;
        break;

      case "TRANSFER":
        categoryChange = 0;
        break;
    }

    const categoryName = movement.item.category.name;

    stockByCategoryMap.set(
      categoryName,
      (stockByCategoryMap.get(categoryName) ?? 0) + categoryChange,
    );
  }

  // Build 8 Monday-based week buckets.
  const weeklyBuckets = Array.from({ length: 8 }, (_, index) => {
    const bucketStart = new Date(eightWeeksAgo);
    bucketStart.setDate(bucketStart.getDate() + index * 7);

    return {
      start: bucketStart,
      weekLabel: bucketStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      receiptQuantity: 0,
      issueQuantity: 0,
    };
  });

  // Assign receipts and issues to their week bucket.
  for (const movement of weeklyMovements) {
    if (movement.kind !== "RECEIPT" && movement.kind !== "ISSUE") {
      continue;
    }

    const movementWeekStart = startOfWeek(movement.createdAt);

    const bucket = weeklyBuckets.find(
      (week) => week.start.getTime() === movementWeekStart.getTime(),
    );

    if (!bucket) {
      continue;
    }

    if (movement.kind === "RECEIPT") {
      bucket.receiptQuantity += movement.quantity;
    } else {
      bucket.issueQuantity += movement.quantity;
    }
  }

  return {
    activeItemsCount,
    lowStockItemsCount,
    movementsTodayCount,
    distinctItemsMovedThisWeekCount: distinctItemsMoved.length,

    stockByCategory: Array.from(stockByCategoryMap.entries()).map(
      ([categoryName, totalOnHand]) => ({
        categoryName,
        totalOnHand,
      }),
    ),

    stockByLocation: locations.map((location) => ({
      locationName: location.name,
      totalOnHand: stockByLocationMap.get(location.id) ?? 0,
    })),

    weeklyReceiptIssueVolume: weeklyBuckets.map(
      ({ weekLabel, receiptQuantity, issueQuantity }) => ({
        weekLabel,
        receiptQuantity,
        issueQuantity,
      }),
    ),
  };
}