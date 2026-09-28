import { login } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to Inventory & Stock Control
            </p>
          </div>

          {params.error === "invalid" && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Invalid email or password.
            </div>
          )}

          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Demo credentials
            </h2>

            <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Manager:</span>{" "}
                manager@example.com / password123
              </p>

              <p>
                <span className="font-medium text-gray-800">Staff 1:</span>{" "}
                staff1@example.com / password123
              </p>

              <p>
                <span className="font-medium text-gray-800">Staff 2:</span>{" "}
                staff2@example.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}