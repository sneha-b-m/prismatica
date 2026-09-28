"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { StockMovementKind } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUser, requireManager } from "@/lib/auth";
import { requireLocationAccess } from "@/lib/permissions";
import { assertEnoughStock } from "@/lib/stock";

export async function createStockMovement(formData: FormData) {
  const user = await requireUser();

  const kindValue = String(formData.get("kind") ?? "").trim();
  const itemIdValue = String(formData.get("itemId") ?? "").trim();
  const quantityValue = String(formData.get("quantity") ?? "").trim();

  const locationIdValue = String(
    formData.get("locationId") ?? ""
  ).trim();

  const sourceLocationIdValue = String(
    formData.get("sourceLocationId") ?? ""
  ).trim();

  const destinationLocationIdValue = String(
    formData.get("destinationLocationId") ?? ""
  ).trim();

  const reason = String(formData.get("reason") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!kindValue) {
    throw new Error("Movement type is required.");
  }

  if (
    kindValue !== "RECEIPT" &&
    kindValue !== "ISSUE" &&
    kindValue !== "TRANSFER" &&
    kindValue !== "ADJUSTMENT"
  ) {
    throw new Error("Invalid movement type.");
  }

  const kind = kindValue as StockMovementKind;

  if (!itemIdValue) {
    throw new Error("Item is required.");
  }

  const itemId = Number(itemIdValue);

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

  if (item.archived) {
    throw new Error("Archived items cannot receive new stock movements.");
  }

  if (!quantityValue) {
    throw new Error("Quantity is required.");
  }

  const quantity = Number(quantityValue);

  if (!Number.isInteger(quantity) || quantity === 0) {
    throw new Error("Quantity must be a non-zero integer.");
  }

  if (
    (kind === "RECEIPT" ||
      kind === "ISSUE" ||
      kind === "TRANSFER") &&
    quantity <= 0
  ) {
    throw new Error(
      `${kind} quantity must be a positive integer.`
    );
  }

  // -------------------------------------------------------
  // RECEIPT
  // -------------------------------------------------------

  if (kind === "RECEIPT") {
    if (!locationIdValue) {
      throw new Error("Location is required for a receipt.");
    }

    const locationId = Number(locationIdValue);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      throw new Error("Invalid location.");
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      throw new Error("Selected location does not exist.");
    }

    await requireLocationAccess(
      user.id,
      user.role,
      locationId
    );

    await prisma.stockMovement.create({
      data: {
        itemId,
        kind,
        quantity,
        locationId,
        reason: reason || null,
        notes: notes || null,
        performedById: user.id,
      },
    });
  }

  // -------------------------------------------------------
  // ISSUE
  // -------------------------------------------------------

  if (kind === "ISSUE") {
    if (!locationIdValue) {
      throw new Error("Location is required for an issue.");
    }

    const locationId = Number(locationIdValue);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      throw new Error("Invalid location.");
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      throw new Error("Selected location does not exist.");
    }

    await requireLocationAccess(
      user.id,
      user.role,
      locationId
    );

    await assertEnoughStock(
      itemId,
      locationId,
      quantity
    );

    await prisma.stockMovement.create({
      data: {
        itemId,
        kind,
        quantity,
        locationId,
        reason: reason || null,
        notes: notes || null,
        performedById: user.id,
      },
    });
  }

  // -------------------------------------------------------
  // TRANSFER
  // -------------------------------------------------------

  if (kind === "TRANSFER") {
    if (!sourceLocationIdValue) {
      throw new Error(
        "Source location is required for a transfer."
      );
    }

    if (!destinationLocationIdValue) {
      throw new Error(
        "Destination location is required for a transfer."
      );
    }

    const sourceLocationId = Number(sourceLocationIdValue);
    const destinationLocationId = Number(
      destinationLocationIdValue
    );

    if (
      !Number.isInteger(sourceLocationId) ||
      sourceLocationId <= 0
    ) {
      throw new Error("Invalid source location.");
    }

    if (
      !Number.isInteger(destinationLocationId) ||
      destinationLocationId <= 0
    ) {
      throw new Error("Invalid destination location.");
    }

    if (sourceLocationId === destinationLocationId) {
      throw new Error(
        "Source and destination locations must be different."
      );
    }

    const [sourceLocation, destinationLocation] =
      await Promise.all([
        prisma.location.findUnique({
          where: {
            id: sourceLocationId,
          },
        }),
        prisma.location.findUnique({
          where: {
            id: destinationLocationId,
          },
        }),
      ]);

    if (!sourceLocation) {
      throw new Error("Source location does not exist.");
    }

    if (!destinationLocation) {
      throw new Error("Destination location does not exist.");
    }

    await requireLocationAccess(
      user.id,
      user.role,
      sourceLocationId
    );

    await requireLocationAccess(
      user.id,
      user.role,
      destinationLocationId
    );

    await assertEnoughStock(
      itemId,
      sourceLocationId,
      quantity
    );

    await prisma.stockMovement.create({
      data: {
        itemId,
        kind,
        quantity,
        sourceLocationId,
        destinationLocationId,
        reason: reason || null,
        notes: notes || null,
        performedById: user.id,
      },
    });
  }

  // -------------------------------------------------------
  // ADJUSTMENT
  // -------------------------------------------------------

  if (kind === "ADJUSTMENT") {
    await requireManager();

    if (!locationIdValue) {
      throw new Error(
        "Location is required for an adjustment."
      );
    }

    const locationId = Number(locationIdValue);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      throw new Error("Invalid location.");
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      throw new Error("Selected location does not exist.");
    }

    if (!reason) {
      throw new Error(
        "A reason is required for an adjustment."
      );
    }

    if (quantity < 0) {
      await assertEnoughStock(
        itemId,
        locationId,
        Math.abs(quantity)
      );
    }

    await prisma.stockMovement.create({
      data: {
        itemId,
        kind,
        quantity,
        locationId,
        reason,
        notes: notes || null,
        performedById: user.id,
      },
    });
  }

  revalidatePath("/movements");
  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);

  redirect(`/items/${itemId}`);
}