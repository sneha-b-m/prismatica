"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getItemTotalStock } from "@/lib/stock";

export async function dismissLowStockAlert(itemId: number) {
  const manager = await requireManager();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid item ID.");
  }

  const item = await prisma.item.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new Error("Item not found.");
  }

  const totalOnHand = await getItemTotalStock(itemId);

  if (item.archived || totalOnHand > item.reorderLevel) {
    throw new Error("Item is not currently low stock.");
  }

  await prisma.lowStockAlertDismissal.upsert({
    where: {
      itemId_dismissedById: {
        itemId,
        dismissedById: manager.id,
      },
    },
    update: {
      dismissedAt: new Date(),
    },
    create: {
      itemId,
      dismissedById: manager.id,
      dismissedAt: new Date(),
    },
  });

  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  revalidatePath("/items");

  redirect("/alerts");
}