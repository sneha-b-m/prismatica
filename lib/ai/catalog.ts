import "server-only";

import { requireUser } from "@/lib/auth";
import {
  getCategoriesForList,
  getLocationsForList,
} from "@/lib/inventory";

export type AiCatalogEntry = {
  id: number;
  name: string;
};

export type AiCatalog = {
  categories: AiCatalogEntry[];
  locations: AiCatalogEntry[];
};

/**
 * Loads the same categories and locations already used by the Items page.
 *
 * Authentication is required because this is server-side inventory data.
 * Category and Location have no archived/soft-delete fields in the schema,
 * so there is nothing additional to exclude here.
 */
export async function getAiCatalog(): Promise<AiCatalog> {
  await requireUser();

  const [categories, locations] = await Promise.all([
    getCategoriesForList(),
    getLocationsForList(),
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
  };
}