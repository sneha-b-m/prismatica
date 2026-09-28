"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aiSearchAction,
  type AiSearchActionResult,
} from "@/app/actions/ai-search";

type AiSearchBoxProps = {
  currentParams?: {
    sort?: "name" | "onHand" | "reorderLevel";
    direction?: "asc" | "desc";
    pageSize?: string;
  };
};

export default function AiSearchBox({
  currentParams,
}: AiSearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || isPending) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const result: AiSearchActionResult =
          await aiSearchAction({
            query: trimmedQuery,
            currentParams,
          });

        if (!result.ok) {
          setError(result.error);
          return;
        }

        router.push(result.url);
      } catch {
        setError(
          "AI search failed. Please try again."
        );
      }
    });
  }

  return (
    <section
      aria-labelledby="ai-search-heading"
      className="mt-6 rounded-lg border border-gray-200 bg-white p-4"
    >
      <form onSubmit={handleSubmit}>
        <div>
          <label
            id="ai-search-heading"
            htmlFor="ai-search-query"
            className="block text-sm font-medium text-gray-700"
          >
            ✨ AI Search
          </label>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="ai-search-query"
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="e.g. show low stock electronics in Mumbai"
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />

            <button
              type="submit"
              disabled={isPending || !query.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Searching…" : "Search"}
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}