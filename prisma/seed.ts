import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  // -------------------------------------------------------
  // 1. CLEAR EXISTING DATA
  // -------------------------------------------------------
  // Delete in dependency order so foreign-key constraints
  // are not violated.

  await prisma.lowStockAlertDismissal.deleteMany();
  await prisma.itemTimelineEvent.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.staffLocationAssignment.deleteMany();

  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing data cleared.");

  // -------------------------------------------------------
  // 2. PASSWORD
  // -------------------------------------------------------

  const passwordHash = await bcrypt.hash("password123", 10);

  // -------------------------------------------------------
  // 3. USERS
  // -------------------------------------------------------

  const manager = await prisma.user.create({
    data: {
      email: "manager@example.com",
      name: "Demo Manager",
      passwordHash,
      role: "MANAGER",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: "staff1@example.com",
      name: "Staff One",
      passwordHash,
      role: "STAFF",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: "staff2@example.com",
      name: "Staff Two",
      passwordHash,
      role: "STAFF",
    },
  });

  console.log("Users created.");

  // -------------------------------------------------------
  // 4. LOCATIONS
  // -------------------------------------------------------

  const warehouse = await prisma.location.create({
    data: {
      name: "Main Warehouse",
      code: "WH-01",
      address: "Main Warehouse",
    },
  });

  const branchA = await prisma.location.create({
    data: {
      name: "Branch A",
      code: "BR-01",
      address: "Branch A",
    },
  });

  const branchB = await prisma.location.create({
    data: {
      name: "Branch B",
      code: "BR-02",
      address: "Branch B",
    },
  });

  console.log("Locations created.");

  // -------------------------------------------------------
  // 5. CATEGORIES
  // -------------------------------------------------------

  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      description: "Electronic equipment and devices",
    },
  });

  const office = await prisma.category.create({
    data: {
      name: "Office Supplies",
      description: "General office supplies",
    },
  });

  const hardware = await prisma.category.create({
    data: {
      name: "Hardware",
      description: "Hardware, tools and components",
    },
  });

  const safety = await prisma.category.create({
    data: {
      name: "Safety Equipment",
      description: "Personal and workplace safety equipment",
    },
  });

  console.log("Categories created.");

  // -------------------------------------------------------
  // 6. INVENTORY ITEMS
  // -------------------------------------------------------

  const laptop = await prisma.item.create({
    data: {
      sku: "ELEC-001",
      name: "Laptop",
      description: "Business laptop",
      unitOfMeasure: "pcs",
      reorderLevel: 5,
      categoryId: electronics.id,
    },
  });

  const monitor = await prisma.item.create({
    data: {
      sku: "ELEC-002",
      name: "24-inch Monitor",
      description: "Full HD office monitor",
      unitOfMeasure: "pcs",
      reorderLevel: 5,
      categoryId: electronics.id,
    },
  });

  const keyboard = await prisma.item.create({
    data: {
      sku: "ELEC-003",
      name: "Keyboard",
      description: "USB keyboard",
      unitOfMeasure: "pcs",
      reorderLevel: 10,
      categoryId: electronics.id,
    },
  });

  const paper = await prisma.item.create({
    data: {
      sku: "OFF-001",
      name: "A4 Paper",
      description: "500-sheet A4 paper pack",
      unitOfMeasure: "packs",
      reorderLevel: 20,
      categoryId: office.id,
    },
  });

  const pens = await prisma.item.create({
    data: {
      sku: "OFF-002",
      name: "Ballpoint Pens",
      description: "Blue ballpoint pens",
      unitOfMeasure: "boxes",
      reorderLevel: 10,
      categoryId: office.id,
    },
  });

  const drill = await prisma.item.create({
    data: {
      sku: "HARD-001",
      name: "Cordless Drill",
      description: "18V cordless drill",
      unitOfMeasure: "pcs",
      reorderLevel: 3,
      categoryId: hardware.id,
    },
  });

  const gloves = await prisma.item.create({
    data: {
      sku: "SAFE-001",
      name: "Safety Gloves",
      description: "Protective work gloves",
      unitOfMeasure: "pairs",
      reorderLevel: 15,
      categoryId: safety.id,
    },
  });

  const helmet = await prisma.item.create({
    data: {
      sku: "SAFE-002",
      name: "Safety Helmet",
      description: "Industrial safety helmet",
      unitOfMeasure: "pcs",
      reorderLevel: 10,
      categoryId: safety.id,
    },
  });

  console.log("8 inventory items created.");

  // -------------------------------------------------------
  // 7. STAFF-LOCATION ASSIGNMENTS
  // -------------------------------------------------------

  await prisma.staffLocationAssignment.createMany({
    data: [
      {
        userId: staff1.id,
        locationId: warehouse.id,
      },
      {
        userId: staff1.id,
        locationId: branchA.id,
      },
      {
        userId: staff2.id,
        locationId: warehouse.id,
      },
      {
        userId: staff2.id,
        locationId: branchB.id,
      },
    ],
  });

  console.log("Staff-location assignments created.");

  // -------------------------------------------------------
  // 8. STOCK MOVEMENTS
  // -------------------------------------------------------
  // Receipts create initial stock.
  // Issues consume part of that stock.
  // Transfers move stock between locations.
  //
  // These quantities are deliberately kept valid so the
  // resulting stock position never goes negative.

  await prisma.stockMovement.createMany({
    data: [
      // Laptop: 20 received into warehouse
      {
        itemId: laptop.id,
        kind: "RECEIPT",
        quantity: 20,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial laptop stock",
      },

      // Laptop: 5 issued from warehouse
      {
        itemId: laptop.id,
        kind: "ISSUE",
        quantity: 5,
        locationId: warehouse.id,
        performedById: staff1.id,
        notes: "Issued for office use",
      },

      // Monitor: 15 received into warehouse
      {
        itemId: monitor.id,
        kind: "RECEIPT",
        quantity: 15,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial monitor stock",
      },

      // Monitor: 5 transferred from warehouse to Branch A
      {
        itemId: monitor.id,
        kind: "TRANSFER",
        quantity: 5,
        sourceLocationId: warehouse.id,
        destinationLocationId: branchA.id,
        performedById: manager.id,
        notes: "Stock transfer to Branch A",
      },

      // Keyboard: 30 received into warehouse
      {
        itemId: keyboard.id,
        kind: "RECEIPT",
        quantity: 30,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial keyboard stock",
      },

      // Paper: 100 packs received into warehouse
      {
        itemId: paper.id,
        kind: "RECEIPT",
        quantity: 100,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial paper stock",
      },

      // Paper: 20 packs issued
      {
        itemId: paper.id,
        kind: "ISSUE",
        quantity: 20,
        locationId: warehouse.id,
        performedById: staff2.id,
        notes: "Office consumption",
      },

      // Pens: 50 boxes received
      {
        itemId: pens.id,
        kind: "RECEIPT",
        quantity: 50,
        locationId: branchB.id,
        performedById: manager.id,
        notes: "Initial branch stock",
      },

      // Drill: 10 received
      {
        itemId: drill.id,
        kind: "RECEIPT",
        quantity: 10,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial drill stock",
      },

      // Gloves: 20 received
      {
        itemId: gloves.id,
        kind: "RECEIPT",
        quantity: 20,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial safety equipment stock",
      },

      // Gloves: 6 issued
      {
        itemId: gloves.id,
        kind: "ISSUE",
        quantity: 6,
        locationId: warehouse.id,
        performedById: staff1.id,
        notes: "Issued to workers",
      },

      // Helmet: 12 received
      {
        itemId: helmet.id,
        kind: "RECEIPT",
        quantity: 12,
        locationId: warehouse.id,
        performedById: manager.id,
        notes: "Initial helmet stock",
      },

      // Helmet: adjustment +2
      {
        itemId: helmet.id,
        kind: "ADJUSTMENT",
        quantity: 2,
        locationId: warehouse.id,
        performedById: manager.id,
        reason: "Physical stock count correction",
        notes: "Two additional helmets found during count",
      },
    ],
  });

  console.log("Sample stock movements created.");

  console.log("Database seed completed successfully.");
  console.log("");
  console.log("Demo accounts:");
  console.log("Manager: manager@example.com / password123");
  console.log("Staff:   staff1@example.com / password123");
  console.log("Staff:   staff2@example.com / password123");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });