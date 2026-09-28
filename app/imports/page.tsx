import { requireManager } from "@/lib/auth";

import ImportForms from "./ImportForms";

export default async function ImportsPage() {
  await requireManager();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          CSV Imports
        </h1>
      </div>

      <ImportForms />
    </div>
  );
}