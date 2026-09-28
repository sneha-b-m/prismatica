import { z } from "zod";

/**
 * Filters understood by the natural-language inventory search layer.
 *
 * These are intentionally NOT the same as the database fields:
 * - category/location are names here, not IDs.
 * - The existing inventory layer will resolve/use the corresponding IDs later.
 *
 * archived uses the same values as the existing Items search:
 * "active" | "archived" | "all"
 */
export const aiSearchFiltersSchema = z
  .object({
    q: z.string().trim().max(100),

    category: z.preprocess(
      (value) => {
        if (typeof value === "string" && value.trim() === "") {
          return null;
        }

        return value;
      },
      z.string().trim().max(100).nullable(),
    ),

    location: z.preprocess(
      (value) => {
        if (typeof value === "string" && value.trim() === "") {
          return null;
        }

        return value;
      },
      z.string().trim().max(100).nullable(),
    ),

    lowStock: z.boolean().nullable().default(null),

    // Maps directly to ItemListSearchParams.archived:
    // active | archived | all
    archived: z.enum(["active", "archived", "all"]).default("active"),
  })
  .strip();

export type AiSearchFilters = z.infer<typeof aiSearchFiltersSchema>;

export type ParseAiFiltersResult =
  | {
      ok: true;
      data: AiSearchFilters;
    }
  | {
      ok: false;
      error: z.ZodError;
    };

export function parseAiFilters(raw: unknown): ParseAiFiltersResult {
  const result = aiSearchFiltersSchema.safeParse(raw);

  if (!result.success) {
    return {
      ok: false,
      error: result.error,
    };
  }

  return {
    ok: true,
    data: result.data,
  };
}