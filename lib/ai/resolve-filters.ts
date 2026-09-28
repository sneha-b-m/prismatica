import "server-only";

import type { ItemListSearchParams } from "@/lib/inventory";
import type { AiSearchFilters } from "@/lib/ai/search-schema";

export type ResolverCatalogEntry = {
  id: number;
  name: string;
};

export type ResolverCatalog = {
  categories: ResolverCatalogEntry[];
  locations: ResolverCatalogEntry[];
};

export type ResolveFiltersResult = {
  params: ItemListSearchParams;
  notices: string[];
};

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Simple singular/plural normalization.
 *
 * This intentionally handles only common simple cases.
 * Ambiguous matches are never guessed.
 */
function singularForms(value: string): string[] {
  const normalized = normalize(value);

  const forms = new Set<string>([normalized]);

  if (normalized.endsWith("ies") && normalized.length > 3) {
    forms.add(`${normalized.slice(0, -3)}y`);
  }

  if (normalized.endsWith("es") && normalized.length > 2) {
    forms.add(normalized.slice(0, -2));
  }

  if (normalized.endsWith("s") && normalized.length > 1) {
    forms.add(normalized.slice(0, -1));
  }

  return [...forms];
}

function matchesSingularOrPlural(
  query: string,
  candidate: string,
): boolean {
  const queryForms = singularForms(query);
  const candidateForms = singularForms(candidate);

  return queryForms.some((queryForm) =>
    candidateForms.includes(queryForm),
  );
}

function resolveCatalogEntry(
  value: string | null,
  entries: ResolverCatalogEntry[],
): ResolverCatalogEntry | null {
  if (!value?.trim()) {
    return null;
  }

  const normalizedValue = normalize(value);

  // 1. Exact match.
  const exactMatches = entries.filter(
    (entry) => normalize(entry.name) === normalizedValue,
  );

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  if (exactMatches.length > 1) {
    return null;
  }

  // 2. Simple singular/plural match.
  const singularPluralMatches = entries.filter((entry) =>
    matchesSingularOrPlural(value, entry.name),
  );

  if (singularPluralMatches.length === 1) {
    return singularPluralMatches[0];
  }

  // If more than one candidate matches, don't guess.
  if (singularPluralMatches.length > 1) {
    return null;
  }

  // 3. Prefix/contains match.
  const containsMatches = entries.filter((entry) => {
    const candidate = normalize(entry.name);

    return (
      candidate.startsWith(normalizedValue) ||
      candidate.includes(normalizedValue) ||
      normalizedValue.includes(candidate)
    );
  });

  // Only accept if exactly one candidate exists.
  if (containsMatches.length === 1) {
    return containsMatches[0];
  }

  return null;
}

function appendToQuery(
  q: string,
  value: string,
): string {
  const existing = q.trim();
  const addition = value.trim();

  if (!addition) {
    return existing;
  }

  if (!existing) {
    return addition;
  }

  return `${existing} ${addition}`;
}

function addUnresolvedNotice(
  notices: string[],
  type: "category" | "location",
  value: string,
): void {
  notices.push(
    `No ${type} matching "${value}" – searched by text instead`,
  );
}

export function resolveFilters(
  filters: AiSearchFilters,
  catalog: ResolverCatalog,
): ResolveFiltersResult {
  const notices: string[] = [];

  let q = filters.q.trim();

  const resolvedCategory = resolveCatalogEntry(
    filters.category,
    catalog.categories,
  );

  const resolvedLocation = resolveCatalogEntry(
    filters.location,
    catalog.locations,
  );

  if (filters.category && !resolvedCategory) {
    q = appendToQuery(q, filters.category);
    addUnresolvedNotice(
      notices,
      "category",
      filters.category,
    );
  }

  if (filters.location && !resolvedLocation) {
    q = appendToQuery(q, filters.location);
    addUnresolvedNotice(
      notices,
      "location",
      filters.location,
    );
  }

  const params: ItemListSearchParams = {};

  // Normal text search.
  if (q) {
    params.q = q;
  }

  // Only send an ID when the catalog resolution succeeded.
  if (resolvedCategory) {
    params.categoryId = String(resolvedCategory.id);
  }

  if (resolvedLocation) {
    params.locationId = String(resolvedLocation.id);
  }

  // The existing form only sends lowStock when enabled.
  if (filters.lowStock === true) {
    params.lowStock = "true";
  }

  /*
   * The existing Items form displays "active" as its default.
   * Therefore omit archived when it is "active".
   */
  if (filters.archived !== "active") {
    params.archived = filters.archived;
  }

  return {
    params,
    notices,
  };
}

export function buildItemsUrl(
  params: ItemListSearchParams,
  options: { ai: true },
): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId);
  }

  if (params.locationId) {
    searchParams.set("locationId", params.locationId);
  }

  if (params.lowStock === "true") {
    searchParams.set("lowStock", "true");
  }

  if (params.archived) {
    searchParams.set("archived", params.archived);
  }

  /*
   * Preserve sorting only when explicitly supplied by the caller.
   */
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.direction) {
    searchParams.set("direction", params.direction);
  }

  if (params.pageSize) {
    searchParams.set("pageSize", params.pageSize);
  }

  /*
   * Every new AI search starts from page 1.
   * We deliberately do not copy params.page.
   */
  if (options.ai) {
    searchParams.set("ai", "1");
  }

  const query = searchParams.toString();

  return query ? `/items?${query}` : "/items?ai=1";
}