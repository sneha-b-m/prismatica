import type { CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getMovementFormOptions(user: CurrentUser) {
  const [activeItems, locations] = await Promise.all([
    prisma.item.findMany({
      where: {
        archived: false,
      },
      orderBy: {
        name: "asc",
      },
    }),

    user.role === "MANAGER"
      ? prisma.location.findMany({
          orderBy: {
            name: "asc",
          },
        })
      : prisma.location.findMany({
          where: {
            staffAssignments: {
              some: {
                userId: user.id,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        }),
  ]);

  return {
    activeItems,
    locations,
  };
}