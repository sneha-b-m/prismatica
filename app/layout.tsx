import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { getLowStockAlertCount } from "@/lib/alerts";

export const metadata: Metadata = {
  title: "Inventory & Stock Control",
  description: "Inventory and stock control application",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Items", href: "/items" },
  { name: "Categories", href: "/categories" },
  { name: "Locations", href: "/locations" },
  { name: "Movements", href: "/movements" },
  { name: "Alerts", href: "/alerts" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const lowStockAlertCount = user
    ? await getLowStockAlertCount()
    : 0;

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h1 className="text-lg font-semibold">
                Inventory Control
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Stock Management
              </p>
            </div>

            <nav className="px-4 py-6">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Navigation
              </p>

              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <span>{item.name}</span>

                    {item.href === "/alerts" &&
                    lowStockAlertCount > 0 ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {lowStockAlertCount}
                      </span>
                    ) : null}
                  </Link>
                ))}

                {user?.role === "MANAGER" ? (
                  <>
                    <Link
                      href="/users"
                      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Users / Assignments
                    </Link>

                    <Link
                      href="/imports"
                      className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Imports
                    </Link>
                  </>
                ) : null}
              </div>
            </nav>
          </aside>

          {/* Main area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
              <div>
                <h2 className="text-base font-medium">
                  Inventory & Stock Control
                </h2>
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {user.role}
                    </p>
                  </div>

                  <form action={logout}>
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Sign in
                </Link>
              )}
            </header>

            {/* Content */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}