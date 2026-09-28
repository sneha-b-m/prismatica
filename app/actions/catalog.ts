"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManager, requireUser } from "@/lib/auth";

export async function createCategory(formData: FormData) {
  const manager = await requireManager();

  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;

  if (!name) {
    throw new Error("Category name is required.");
  }

  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new Error("A category with this name already exists.");
  }

  await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  revalidatePath("/items");
  revalidatePath("/categories");
}

export async function createLocation(formData: FormData) {
  const manager = await requireManager();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;

  if (!name) {
    throw new Error("Location name is required.");
  }

  if (!code) {
    throw new Error("Location code is required.");
  }

  const existingLocation = await prisma.location.findUnique({
    where: { name },
  });

  if (existingLocation) {
    throw new Error("A location with this name already exists.");
  }

  await prisma.location.create({
    data: {
      name,
      code,
      address,
    },
  });

  revalidatePath("/items");
  revalidatePath("/locations");
}

export async function createItem(formData: FormData) {
  const manager = await requireManager();

  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const unitOfMeasure = String(formData.get("unitOfMeasure") ?? "").trim();
  const reorderLevelValue = String(formData.get("reorderLevel") ?? "").trim();
  const categoryIdValue = String(formData.get("categoryId") ?? "").trim();

  if (!sku) {
    throw new Error("SKU is required.");
  }

  if (!name) {
    throw new Error("Item name is required.");
  }

  if (!unitOfMeasure) {
    throw new Error("Unit of measure is required.");
  }

  if (!reorderLevelValue) {
    throw new Error("Reorder level is required.");
  }

  if (!categoryIdValue) {
    throw new Error("Category is required.");
  }

  const reorderLevel = Number(reorderLevelValue);
  const categoryId = Number(categoryIdValue);

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    throw new Error("Reorder level must be zero or a positive integer.");
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("A valid category is required.");
  }

  const existingItem = await prisma.item.findUnique({
    where: { sku },
  });

  if (existingItem) {
    throw new Error("An item with this SKU already exists.");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Selected category does not exist.");
  }

  const item = await prisma.item.create({
    data: {
      sku,
      name,
      description,
      unitOfMeasure,
      reorderLevel,
      categoryId,
    },
  });

  await prisma.itemTimelineEvent.create({
    data: {
      itemId: item.id,
      createdById: manager.id,
      eventType: "ITEM_CREATED",
      description: "Item created",
    },
  });

  revalidatePath("/items");
  revalidatePath(`/items/${item.id}`);

  redirect(`/items/${item.id}`);
}

export async function updateItem(itemId: number, formData: FormData) {
  const manager = await requireManager();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid item ID.");
  }

  const existingItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: { category: true },
  });

  if (!existingItem) {
    throw new Error("Item not found.");
  }

  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const unitOfMeasure = String(formData.get("unitOfMeasure") ?? "").trim();
  const reorderLevelValue = String(formData.get("reorderLevel") ?? "").trim();
  const categoryIdValue = String(formData.get("categoryId") ?? "").trim();

  if (!sku) {
    throw new Error("SKU is required.");
  }

  if (!name) {
    throw new Error("Item name is required.");
  }

  if (!unitOfMeasure) {
    throw new Error("Unit of measure is required.");
  }

  if (!reorderLevelValue) {
    throw new Error("Reorder level is required.");
  }

  if (!categoryIdValue) {
    throw new Error("Category is required.");
  }

  const reorderLevel = Number(reorderLevelValue);
  const categoryId = Number(categoryIdValue);

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    throw new Error("Reorder level must be zero or a positive integer.");
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("A valid category is required.");
  }

  const duplicateSku = await prisma.item.findFirst({
    where: {
      sku,
      NOT: {
        id: itemId,
      },
    },
  });

  if (duplicateSku) {
    throw new Error("An item with this SKU already exists.");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Selected category does not exist.");
  }

  const changes: Array<{
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    description: string;
  }> = [];

  if (existingItem.sku !== sku) {
    changes.push({
      fieldName: "sku",
      oldValue: existingItem.sku,
      newValue: sku,
      description: "SKU changed",
    });
  }

  if (existingItem.name !== name) {
    changes.push({
      fieldName: "name",
      oldValue: existingItem.name,
      newValue: name,
      description: "Name changed",
    });
  }

  if (existingItem.description !== description) {
    changes.push({
      fieldName: "description",
      oldValue: existingItem.description,
      newValue: description,
      description: "Description changed",
    });
  }

  if (existingItem.unitOfMeasure !== unitOfMeasure) {
    changes.push({
      fieldName: "unitOfMeasure",
      oldValue: existingItem.unitOfMeasure,
      newValue: unitOfMeasure,
      description: "Unit of measure changed",
    });
  }

  if (existingItem.reorderLevel !== reorderLevel) {
    changes.push({
      fieldName: "reorderLevel",
      oldValue: String(existingItem.reorderLevel),
      newValue: String(reorderLevel),
      description: "Reorder level changed",
    });
  }

  if (existingItem.categoryId !== categoryId) {
    changes.push({
      fieldName: "categoryId/category",
      oldValue: existingItem.category?.name ?? String(existingItem.categoryId),
      newValue: category.name,
      description: "Category changed",
    });
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      sku,
      name,
      description,
      unitOfMeasure,
      reorderLevel,
      categoryId,
    },
  });

  if (changes.length > 0) {
    await prisma.itemTimelineEvent.createMany({
      data: changes.map((change) => ({
        itemId,
        createdById: manager.id,
        eventType: "FIELD_CHANGED",
        fieldName: change.fieldName,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: change.description,
      })),
    });
  }

  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);

  redirect(`/items/${itemId}`);
}

export async function addItemNote(itemId: number, formData: FormData) {
  const user = await requireUser();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid item ID.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Item not found.");
  }

  const note = String(formData.get("note") ?? "").trim();

  if (!note) {
    throw new Error("Note cannot be empty.");
  }

  await prisma.itemTimelineEvent.create({
    data: {
      itemId,
      createdById: user.id,
      eventType: "NOTE",
      description: note,
    },
  });

  revalidatePath(`/items/${itemId}`);

  redirect(`/items/${itemId}`);
}

export async function archiveItem(itemId: number) {
  const manager = await requireManager();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid item ID.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Item not found.");
  }

  if (item.archived) {
    throw new Error("Item is already archived.");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      archived: true,
    },
  });

  await prisma.itemTimelineEvent.create({
    data: {
      itemId,
      createdById: manager.id,
      eventType: "ITEM_ARCHIVED",
      description: "Item archived",
    },
  });

  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);

  redirect(`/items/${itemId}`);
}

export async function restoreItem(itemId: number) {
  const manager = await requireManager();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid item ID.");
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Item not found.");
  }

  if (!item.archived) {
    throw new Error("Item is already active.");
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      archived: false,
    },
  });

  await prisma.itemTimelineEvent.create({
    data: {
      itemId,
      createdById: manager.id,
      eventType: "ITEM_RESTORED",
      description: "Item restored",
    },
  });

  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);

  redirect(`/items/${itemId}`);
}