import { parse } from "csv-parse/sync";

export function parseCsv(csv: string): string[][] {
  return parse(csv, {
    skip_empty_lines: true,
    bom: true,
    relax_column_count: false,
  });
}

export function parseCsvWithHeaders(
  csv: string,
): Record<string, string>[] {
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: false,
  });
}