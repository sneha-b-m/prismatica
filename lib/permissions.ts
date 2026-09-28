import type { UserRole } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";

// Role helpers

export function isManager(role: UserRole): boolean {
  return role === "MANAGER";
}

export function isStaff(role: UserRole): boolean {
  return role === "STAFF";
}

// Permission helpers

export function canManageUsers(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canManageLocations(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canManageCategories(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canManageItems(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canManageAssignments(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canRecordStockMovements(role: UserRole): boolean {
  return role === "MANAGER" || role === "STAFF";
}

export function canDismissLowStockAlerts(role: UserRole): boolean {
  return role === "MANAGER";
}

export function canViewAllLocations(role: UserRole): boolean {
  return role === "MANAGER";
}

// Location-specific permission helpers

export async function canUserAccessLocation(
  userId: number,
  role: UserRole,
  locationId: number,
): Promise<boolean> {
  if (role === "MANAGER") {
    return true;
  }

  const assignment = await prisma.staffLocationAssignment.findUnique({
    where: {
      userId_locationId: {
        userId,
        locationId,
      },
    },
  });

  return Boolean(assignment);
}

export async function requireLocationAccess(
  userId: number,
  role: UserRole,
  locationId: number,
): Promise<void> {
  const allowed = await canUserAccessLocation(
    userId,
    role,
    locationId,
  );

  if (!allowed) {
    throw new Error("User does not have access to this location.");
  }
}