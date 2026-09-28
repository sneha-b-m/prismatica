import { prisma } from "./prisma";

export async function getItemStockByLocation(itemId: number) {
  const [locations, movements] = await Promise.all([
    prisma.location.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.stockMovement.findMany({
      where: {
        itemId,
      },
    }),
  ]);

  const stockByLocation = new Map<number, number>();

  for (const location of locations) {
    stockByLocation.set(location.id, 0);
  }

  for (const movement of movements) {
    switch (movement.kind) {
      case "RECEIPT":
        if (movement.locationId !== null) {
          stockByLocation.set(
            movement.locationId,
            (stockByLocation.get(movement.locationId) ?? 0) +
              movement.quantity
          );
        }
        break;

      case "ISSUE":
        if (movement.locationId !== null) {
          stockByLocation.set(
            movement.locationId,
            (stockByLocation.get(movement.locationId) ?? 0) -
              movement.quantity
          );
        }
        break;

      case "ADJUSTMENT":
        if (movement.locationId !== null) {
          stockByLocation.set(
            movement.locationId,
            (stockByLocation.get(movement.locationId) ?? 0) +
              movement.quantity
          );
        }
        break;

      case "TRANSFER":
        if (movement.sourceLocationId !== null) {
          stockByLocation.set(
            movement.sourceLocationId,
            (stockByLocation.get(movement.sourceLocationId) ?? 0) -
              movement.quantity
          );
        }

        if (movement.destinationLocationId !== null) {
          stockByLocation.set(
            movement.destinationLocationId,
            (stockByLocation.get(movement.destinationLocationId) ?? 0) +
              movement.quantity
          );
        }
        break;
    }
  }

  return locations.map((location) => ({
    locationId: location.id,
    locationName: location.name,
    quantity: stockByLocation.get(location.id) ?? 0,
  }));
}

export async function getItemTotalStock(itemId: number) {
  const stockByLocation = await getItemStockByLocation(itemId);

  return stockByLocation.reduce(
    (total, location) => total + location.quantity,
    0
  );
}

export async function getOnHandForItemAtLocation(
  itemId: number,
  locationId: number
) {
  const stockByLocation = await getItemStockByLocation(itemId);

  return (
    stockByLocation.find(
      (location) => location.locationId === locationId
    )?.quantity ?? 0
  );
}

export async function assertEnoughStock(
  itemId: number,
  locationId: number,
  requestedQuantity: number
) {
  const currentStock = await getOnHandForItemAtLocation(
    itemId,
    locationId
  );

  if (currentStock - requestedQuantity < 0) {
    throw new Error(
      `Insufficient stock for item ${itemId} at location ${locationId}.`
    );
  }
}