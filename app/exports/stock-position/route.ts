import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getItemStockByLocation } from "@/lib/stock";

function escapeCsv(value: string | number | boolean): string {
  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function GET() {
  await requireUser();

  const [items, locations] = await Promise.all([
    prisma.item.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.location.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const rows: string[] = [
    "sku,itemName,category,locationCode,locationName,onHand,reorderLevel,archived",
  ];

  for (const item of items) {
    const stockByLocation = await getItemStockByLocation(item.id);

    for (const stock of stockByLocation) {
      const location = locations.find(
        (location) => location.id === stock.locationId,
      );

      if (!location) {
        continue;
      }

      rows.push(
        [
          escapeCsv(item.sku),
          escapeCsv(item.name),
          escapeCsv(item.category.name),
          escapeCsv(location.code),
          escapeCsv(location.name),
          escapeCsv(stock.quantity),
          escapeCsv(item.reorderLevel),
          escapeCsv(item.archived),
        ].join(","),
      );
    }
  }

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="stock-position.csv"',
    },
  });
}