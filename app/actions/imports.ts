"use server";

import { revalidatePath } from "next/cache";
import { parse } from "csv-parse/sync";

import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ImportRowResult = {
  rowNumber: number;
  success: boolean;
  message: string;
};

type ImportResult = {
  rows: ImportRowResult[];
};

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) >= 0;
}

function getFile(formData: FormData): File {
  const value = formData.get("file");

  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Please select a CSV file.");
  }

  return value;
}

export async function importItemsCsv(
  formData: FormData,
): Promise<ImportResult> {
  const manager = await requireManager();

  const file = getFile(formData);
  const csv = await file.text();

  let rows: Record<string, string>[];

  try {
    rows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });
  } catch {
    throw new Error("Invalid CSV file.");
  }

  const results: ImportRowResult[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rowNumber = index + 2;

    const sku = row.sku?.trim() ?? "";
    const name = row.name?.trim() ?? "";
    const description = row.description?.trim() ?? "";
    const unitOfMeasure = row.unitOfMeasure?.trim() ?? "";
    const reorderLevel = row.reorderLevel?.trim() ?? "";
    const categoryName = row.category?.trim() ?? "";

    if (!sku) {
      results.push({
        rowNumber,
        success: false,
        message: "SKU is required.",
      });
      continue;
    }

    if (!name) {
      results.push({
        rowNumber,
        success: false,
        message: "Name is required.",
      });
      continue;
    }

    if (!unitOfMeasure) {
      results.push({
        rowNumber,
        success: false,
        message: "Unit of measure is required.",
      });
      continue;
    }

    if (!reorderLevel) {
      results.push({
        rowNumber,
        success: false,
        message: "Reorder level is required.",
      });
      continue;
    }

    if (!isNonNegativeInteger(reorderLevel)) {
      results.push({
        rowNumber,
        success: false,
        message: "Reorder level must be a zero or positive integer.",
      });
      continue;
    }

    if (!categoryName) {
      results.push({
        rowNumber,
        success: false,
        message: "Category is required.",
      });
      continue;
    }

    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      results.push({
        rowNumber,
        success: false,
        message: `Category "${categoryName}" does not exist.`,
      });
      continue;
    }

    const existingItem = await prisma.item.findUnique({
      where: {
        sku,
      },
    });

    if (existingItem) {
      results.push({
        rowNumber,
        success: false,
        message: `SKU "${sku}" already exists.`,
      });
      continue;
    }

    try {
      const item = await prisma.item.create({
        data: {
          sku,
          name,
          description: description || null,
          unitOfMeasure,
          reorderLevel: Number(reorderLevel),
          categoryId: category.id,
        },
      });

      await prisma.itemTimelineEvent.create({
        data: {
          itemId: item.id,
          createdById: manager.id,
          eventType: "ITEM_CREATED",
          description: "Item imported from CSV",
        },
      });

      results.push({
        rowNumber,
        success: true,
        message: `Imported item "${sku}".`,
      });
    } catch {
      results.push({
        rowNumber,
        success: false,
        message: `Could not import SKU "${sku}".`,
      });
    }
  }

  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return {
    rows: results,
  };
}

export async function importReceiptsCsv(
  formData: FormData,
): Promise<ImportResult> {
  const manager = await requireManager();

  const file = getFile(formData);
  const csv = await file.text();

  let rows: Record<string, string>[];

  try {
    rows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });
  } catch {
    throw new Error("Invalid CSV file.");
  }

  const results: ImportRowResult[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rowNumber = index + 2;

    const sku = row.sku?.trim() ?? "";
    const locationCode = row.locationCode?.trim() ?? "";
    const quantity = row.quantity?.trim() ?? "";
    const notes = row.notes?.trim() ?? "";

    if (!sku) {
      results.push({
        rowNumber,
        success: false,
        message: "SKU is required.",
      });
      continue;
    }

    if (!locationCode) {
      results.push({
        rowNumber,
        success: false,
        message: "Location code is required.",
      });
      continue;
    }

    if (!quantity) {
      results.push({
        rowNumber,
        success: false,
        message: "Quantity is required.",
      });
      continue;
    }

    if (!isPositiveInteger(quantity)) {
      results.push({
        rowNumber,
        success: false,
        message: "Quantity must be a positive integer.",
      });
      continue;
    }

    const item = await prisma.item.findFirst({
      where: {
        sku,
        archived: false,
      },
    });

    if (!item) {
      results.push({
        rowNumber,
        success: false,
        message: `Active, non-archived item with SKU "${sku}" was not found.`,
      });
      continue;
    }

    const location = await prisma.location.findUnique({
      where: {
        code: locationCode,
      },
    });

    if (!location) {
      results.push({
        rowNumber,
        success: false,
        message: `Location "${locationCode}" was not found.`,
      });
      continue;
    }

    try {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          kind: "RECEIPT",
          quantity: Number(quantity),
          locationId: location.id,
          notes: notes || null,
          performedById: manager.id,
        },
      });

      results.push({
        rowNumber,
        success: true,
        message: `Imported receipt for "${sku}".`,
      });
    } catch {
      results.push({
        rowNumber,
        success: false,
        message: `Could not create receipt for "${sku}".`,
      });
    }
  }

  revalidatePath("/movements");
  revalidatePath("/items");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return {
    rows: results,
  };
}