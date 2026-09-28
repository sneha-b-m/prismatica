"use server";

import { requireUser } from "@/lib/auth";
import { getAiCatalog } from "@/lib/ai/catalog";
import {
  interpretQuery,
  type InterpretQueryResult,
} from "@/lib/ai/run-llm";
import {
  buildItemsUrl,
  resolveFilters,
  type ResolverCatalog,
} from "@/lib/ai/resolve-filters";

type AiSearchCurrentParams = {
  sort?: "name" | "onHand" | "reorderLevel";
  direction?: "asc" | "desc";
  pageSize?: string;
};

export type AiSearchActionInput = {
  query: string;
  currentParams?: AiSearchCurrentParams;
};

export type AiSearchActionResult =
  | {
      ok: true;
      url: string;
      notices: string[];
      usedFallback: boolean;
    }
  | {
      ok: false;
      error: string;
    };

const MAX_QUERY_LENGTH = 200;

function buildFallbackUrl(query: string): string {
  const params = new URLSearchParams();

  params.set("q", query);
  params.set("aiFallback", "1");

  return `/items?${params.toString()}`;
}

function addNoticesToUrl(
  url: string,
  notices: string[],
): string {
  if (notices.length === 0) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  const noticeParams = notices
    .map(
      (notice) =>
        `aiNotice=${encodeURIComponent(notice)}`,
    )
    .join("&");

  return `${url}${separator}${noticeParams}`;
}

function logAiSearchSuccess(
  provider: string,
  latencyMs: number,
): void {
  console.info("[ai-search]", {
    provider,
    latencyMs,
  });
}

function logAiSearchFailure(
  provider: string,
  latencyMs: number,
  reason: string,
): void {
  console.warn("[ai-search]", {
    provider,
    latencyMs,
    reason,
  });
}

export async function aiSearchAction(
  input: AiSearchActionInput,
): Promise<AiSearchActionResult> {
  // Same authentication level as the Items page.
  // Both STAFF and MANAGER are allowed.
  await requireUser();

  const query = input.query.trim();

  if (!query) {
    return {
      ok: false,
      error: "Please enter a search",
    };
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return {
      ok: false,
      error:
        "Search query is too long. Please keep it under 200 characters.",
    };
  }

  const currentParams = input.currentParams ?? {};

  const startedAt = Date.now();

  let catalog: ResolverCatalog;

  try {
    catalog = await getAiCatalog();
  } catch (error) {
    const latencyMs = Date.now() - startedAt;

    logAiSearchFailure(
      "catalog",
      latencyMs,
      "catalog_unavailable",
    );

    // Catalog failure is treated the same as AI being unavailable.
    return {
      ok: true,
      url: buildFallbackUrl(query),
      notices: [
        "AI search unavailable, searched normally instead.",
      ],
      usedFallback: true,
    };
  }

  let interpreted: InterpretQueryResult;

  try {
    interpreted = await interpretQuery(
      query,
      {
        categories: catalog.categories.map(
          (category) => category.name,
        ),
        locations: catalog.locations.map(
          (location) => location.name,
        ),
      },
    );
  } catch {
    const latencyMs = Date.now() - startedAt;

    logAiSearchFailure(
      "unknown",
      latencyMs,
      "unexpected_error",
    );

    return {
      ok: true,
      url: buildFallbackUrl(query),
      notices: [
        "AI search unavailable, searched normally instead.",
      ],
      usedFallback: true,
    };
  }

  const latencyMs = Date.now() - startedAt;

  if (!interpreted.ok) {
    logAiSearchFailure(
      "unknown",
      latencyMs,
      interpreted.reason,
    );

    return {
      ok: true,
      url: buildFallbackUrl(query),
      notices: [
        "AI search unavailable, searched normally instead.",
      ],
      usedFallback: true,
    };
  }

  logAiSearchSuccess(
    interpreted.provider,
    latencyMs,
  );

  const resolved = resolveFilters(
    interpreted.filters,
    catalog,
  );

  const params = {
    ...resolved.params,
    sort: currentParams.sort,
    direction: currentParams.direction,
    pageSize: currentParams.pageSize,
  };

  const baseUrl = buildItemsUrl(params, {
    ai: true,
  });

  const url = addNoticesToUrl(
    baseUrl,
    resolved.notices,
  );

  return {
    ok: true,
    url,
    notices: resolved.notices,
    usedFallback: false,
  };
}