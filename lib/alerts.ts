import "server-only";

import { prisma } from "@/lib/prisma";
import { getItemTotalStock } from "@/lib/stock";

export type LowStockAlert = {
  id: number;
  sku: string;
  name: string;
  categoryName: string;
  reorderLevel: number;
  totalOnHand: number;
  dismissed: boolean;
};

function applyMovementToTotal(
  total: number,
  movement: {
    kind: "RECEIPT" | "ISSUE" | "TRANSFER" | "ADJUSTMENT";
    quantity: number;
  },
) {
  switch (movement.kind) {
    case "RECEIPT":
      return total + movement.quantity;

    case "ISSUE":
      return total - movement.quantity;

    case "ADJUSTMENT":
      return total + movement.quantity;

    case "TRANSFER":
      // Transfers only move stock between locations,
      // so they do not change total stock.
      return total;
  }
}

export async function hasRecoveredAfterDismissal(
  itemId: number,
  reorderLevel: number,
  dismissedAt: Date,
): Promise<boolean> {
  const movements = await prisma.stockMovement.findMany({
    where: {
      itemId,
    },
    orderBy: [
      {
        createdAt: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  // Reconstruct total stock at the time of dismissal.
  let runningTotal = 0;

  for (const movement of movements) {
    if (movement.createdAt > dismissedAt) {
      break;
    }

    runningTotal = applyMovementToTotal(runningTotal, movement);
  }

  // Replay movements after dismissal and look for recovery.
  for (const movement of movements) {
    if (movement.createdAt <= dismissedAt) {
      continue;
    }

    runningTotal = applyMovementToTotal(runningTotal, movement);

    if (runningTotal > reorderLevel) {
      return true;
    }
  }

  return false;
}

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const items = await prisma.item.findMany({
    where: {
      archived: false,
    },
    include: {
      category: true,
      lowStockDismissals: {
        orderBy: {
          dismissedAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const alerts: LowStockAlert[] = [];

  for (const item of items) {
    const totalOnHand = await getItemTotalStock(item.id);

    // Only low-stock items are alerts.
    if (totalOnHand > item.reorderLevel) {
      continue;
    }

    const dismissal = item.lowStockDismissals[0];

    if (dismissal) {
      const recovered = await hasRecoveredAfterDismissal(
        item.id,
        item.reorderLevel,
        dismissal.dismissedAt,
      );

      // If the item never recovered after dismissal,
      // keep the alert hidden.
      if (!recovered) {
        continue;
      }
    }

    alerts.push({
      id: item.id,
      sku: item.sku,
      name: item.name,
      categoryName: item.category.name,
      reorderLevel: item.reorderLevel,
      totalOnHand,
      dismissed: false,
    });
  }

  return alerts;
}

export async function getLowStockAlertCount(): Promise<number> {
  const alerts = await getLowStockAlerts();

  return alerts.length;
}