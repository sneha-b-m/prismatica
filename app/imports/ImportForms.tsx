"use client";

import { useState } from "react";

import {
  importItemsCsv,
  importReceiptsCsv,
} from "@/app/actions/imports";

type ImportRowResult = {
  rowNumber: number;
  success: boolean;
  message: string;
};

type ImportResult = {
  rows: ImportRowResult[];
};

function ResultsTable({ result }: { result: ImportResult | null }) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Row number
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Message
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {result.rows.map((row) => (
            <tr key={row.rowNumber}>
              <td className="px-4 py-3 text-sm text-gray-900">
                {row.rowNumber}
              </td>

              <td className="px-4 py-3 text-sm">
                {row.success ? (
                  <span className="font-medium text-green-600">
                    Success
                  </span>
                ) : (
                  <span className="font-medium text-red-600">
                    Failed
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600">
                {row.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ImportForms() {
  const [itemsResult, setItemsResult] =
    useState<ImportResult | null>(null);

  const [receiptsResult, setReceiptsResult] =
    useState<ImportResult | null>(null);

  const [itemsError, setItemsError] = useState<string | null>(null);
  const [receiptsError, setReceiptsError] =
    useState<string | null>(null);

  const [itemsLoading, setItemsLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  async function handleItemsSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setItemsError(null);
    setItemsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await importItemsCsv(formData);

      setItemsResult(result);
      event.currentTarget.reset();
    } catch (error) {
      setItemsError(
        error instanceof Error
          ? error.message
          : "Could not import items.",
      );
    } finally {
      setItemsLoading(false);
    }
  }

  async function handleReceiptsSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setReceiptsError(null);
    setReceiptsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await importReceiptsCsv(formData);

      setReceiptsResult(result);
      event.currentTarget.reset();
    } catch (error) {
      setReceiptsError(
        error instanceof Error
          ? error.message
          : "Could not import receipts.",
      );
    } finally {
      setReceiptsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Import items */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Import items CSV
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV containing inventory items.
        </p>

        <div className="mt-4 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Sample CSV
          </p>

          <pre className="overflow-x-auto text-sm text-gray-700">
{`sku,name,description,unitOfMeasure,reorderLevel,category`}
          </pre>
        </div>

        <form
          onSubmit={handleItemsSubmit}
          className="mt-5 space-y-4"
        >
          <div>
            <label
              htmlFor="items-file"
              className="block text-sm font-medium text-gray-700"
            >
              CSV file
            </label>

            <input
              id="items-file"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="mt-1 block w-full text-sm text-gray-600"
            />
          </div>

          {itemsError ? (
            <p className="text-sm text-red-600">{itemsError}</p>
          ) : null}

          <button
            type="submit"
            disabled={itemsLoading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {itemsLoading ? "Importing..." : "Import items"}
          </button>
        </form>

        <ResultsTable result={itemsResult} />
      </section>

      {/* Import receipts */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Import receipts CSV
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV containing stock receipts.
        </p>

        <div className="mt-4 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Sample CSV
          </p>

          <pre className="overflow-x-auto text-sm text-gray-700">
{`sku,locationCode,quantity,notes`}
          </pre>
        </div>

        <form
          onSubmit={handleReceiptsSubmit}
          className="mt-5 space-y-4"
        >
          <div>
            <label
              htmlFor="receipts-file"
              className="block text-sm font-medium text-gray-700"
            >
              CSV file
            </label>

            <input
              id="receipts-file"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="mt-1 block w-full text-sm text-gray-600"
            />
          </div>

          {receiptsError ? (
            <p className="text-sm text-red-600">
              {receiptsError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={receiptsLoading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {receiptsLoading
              ? "Importing..."
              : "Import receipts"}
          </button>
        </form>

        <ResultsTable result={receiptsResult} />
      </section>
    </div>
  );
}