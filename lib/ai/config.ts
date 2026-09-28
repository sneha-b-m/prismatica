import "server-only";

type AiProvider = "auto" | "ollama" | "api";

function getProvider(): AiProvider {
  const value = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (value === "ollama" || value === "api") {
    return value;
  }

  return "auto";
}

function getTimeoutMs(): number {
  const value = Number(process.env.AI_TIMEOUT_MS);

  if (!Number.isFinite(value) || value <= 0) {
    return 8000;
  }

  return value;
}

export const aiConfig = {
  provider: getProvider(),

  ollama: {
    baseUrl:
      process.env.OLLAMA_BASE_URL?.trim() ||
      "http://localhost:11434",
    model: process.env.OLLAMA_MODEL?.trim() || "",
  },

  api: {
    baseUrl: process.env.AI_API_BASE_URL?.trim() || "",
    apiKey: process.env.AI_API_KEY?.trim() || "",
    model: process.env.AI_API_MODEL?.trim() || "",
  },

  timeoutMs: getTimeoutMs(),
} as const;

export type AiConfig = typeof aiConfig;
export type { AiProvider };