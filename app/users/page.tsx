import { revalidatePath } from "next/cache";

import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assignStaffToLocation(formData: FormData) {
  "use server";

  await requireManager();

  const userIdValue = String(formData.get("userId") ?? "").trim();
  const locationIdValue = String(formData.get("locationId") ?? "").trim();

  if (!userIdValue || !locationIdValue) {
    throw new Error("User and location are required.");
  }

  const userId = Number(userIdValue);
  const locationId = Number(locationIdValue);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user.");
  }

  if (!Number.isInteger(locationId) || locationId <= 0) {
    throw new Error("Invalid location.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role !== "STAFF") {
    throw new Error("Only STAFF users can be assigned to locations.");
  }

  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    throw new Error("Location not found.");
  }

  const existingAssignment =
    await prisma.staffLocationAssignment.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

  if (!existingAssignment) {
    await prisma.staffLocationAssignment.create({
      data: {
        userId,
        locationId,
      },
    });
  }

  revalidatePath("/users");
}

async function removeStaffFromLocation(formData: FormData) {
  "use server";

  await requireManager();

  const userIdValue = String(formData.get("userId") ?? "").trim();
  const locationIdValue = String(formData.get("locationId") ?? "").trim();

  if (!userIdValue || !locationIdValue) {
    throw new Error("User and location are required.");
  }

  const userId = Number(userIdValue);
  const locationId = Number(locationIdValue);

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !Number.isInteger(locationId) ||
    locationId <= 0
  ) {
    throw new Error("Invalid user or location.");
  }

  await prisma.staffLocationAssignment.deleteMany({
    where: {
      userId,
      locationId,
    },
  });

  revalidatePath("/users");
}

export default async function UsersPage() {
  await requireManager();

  const [users, staffUsers, locations] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        locationAssignments: {
          include: {
            location: true,
          },
          orderBy: {
            location: {
              name: "asc",
            },
          },
        },
      },
    }),

    prisma.user.findMany({
      where: {
        role: "STAFF",
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Users & Assignments
        </h1>

        <p className="mt-2 text-gray-600">
          Manage users, roles, and staff-location assignments.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Assign Staff to Location
        </h2>

        <form
          action={assignStaffToLocation}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="userId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Staff user
            </label>

            <select
              id="userId"
              name="userId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select staff user</option>

              {staffUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="locationId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <select
              id="locationId"
              name="locationId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select location</option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Assign
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Name
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Assigned Locations
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Created Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => {
                const assignedLocations =
                  user.locationAssignments.map(
                    (assignment) => assignment.location.name,
                  );

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.role}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignedLocations.length > 0
                        ? assignedLocations.join(", ")
                        : "None"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Remove Assignment
        </h2>

        <form
          action={removeStaffFromLocation}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="remove-userId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Staff user
            </label>

            <select
              id="remove-userId"
              name="userId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select staff user</option>

              {staffUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="remove-locationId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <select
              id="remove-locationId"
              name="locationId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select location</option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </form>
      </section>
    </div>
  );
}