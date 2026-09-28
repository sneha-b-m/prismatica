import "server-only";

import { aiConfig } from "@/lib/ai/config";
import { buildSystemPrompt } from "@/lib/ai/search-prompt";
import {
  parseAiFilters,
  type AiSearchFilters,
} from "@/lib/ai/search-schema";

import { apiProvider } from "@/lib/ai/providers/api";
import { ollamaProvider } from "@/lib/ai/providers/ollama";

type LlmProvider = {
  name: string;
  complete(args: {
    system: string;
    user: string;
    signal: AbortSignal;
  }): Promise<string>;
};

export type InterpretQueryResult =
  | {
      ok: true;
      filters: AiSearchFilters;
      provider: string;
    }
  | {
      ok: false;
      reason: "unavailable" | "timeout" | "invalid_response";
    };

class AiUnavailableError extends Error {
  constructor(message = "AI provider unavailable") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

class AiTimeoutError extends Error {
  constructor(message = "AI provider timed out") {
    super(message);
    this.name = "AiTimeoutError";
  }
}

function isConfigured(provider: LlmProvider): boolean {
  if (provider.name === "ollama") {
    return Boolean(aiConfig.ollama.model);
  }

  if (provider.name === "api") {
    return Boolean(
      aiConfig.api.baseUrl &&
        aiConfig.api.apiKey &&
        aiConfig.api.model,
    );
  }

  return false;
}

async function callProvider(
  provider: LlmProvider,
  system: string,
  user: string,
): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, aiConfig.timeoutMs);

  try {
    return await provider.complete({
      system,
      user,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new AiTimeoutError();
    }

    throw new AiUnavailableError();
  } finally {
    clearTimeout(timeout);
  }
}

async function runProvider(
  provider: LlmProvider,
  system: string,
  user: string,
) {
  const text = await callProvider(provider, system, user);

  return {
    text,
    provider: provider.name,
  };
}

export async function runLlm(args: {
  system: string;
  user: string;
}): Promise<{
  text: string;
  provider: string;
}> {
  const { system, user } = args;

  if (aiConfig.provider === "ollama") {
    if (!isConfigured(ollamaProvider)) {
      throw new AiUnavailableError(
        "Ollama is not configured.",
      );
    }

    return runProvider(
      ollamaProvider,
      system,
      user,
    );
  }

  if (aiConfig.provider === "api") {
    if (!isConfigured(apiProvider)) {
      throw new AiUnavailableError(
        "API provider is not configured.",
      );
    }

    return runProvider(
      apiProvider,
      system,
      user,
    );
  }

  // auto mode
  const isProduction =
    process.env.NODE_ENV === "production";

  // Production: API only.
  if (isProduction) {
    if (!isConfigured(apiProvider)) {
      throw new AiUnavailableError(
        "API provider is not configured.",
      );
    }

    return runProvider(
      apiProvider,
      system,
      user,
    );
  }

  // Development: Ollama first.
  if (isConfigured(ollamaProvider)) {
    try {
      return await runProvider(
        ollamaProvider,
        system,
        user,
      );
    } catch {
      // Fall back to API.
    }
  }

  // Development: API fallback.
  if (isConfigured(apiProvider)) {
    return runProvider(
      apiProvider,
      system,
      user,
    );
  }

  throw new AiUnavailableError(
    "No AI provider is configured.",
  );
}

function extractJsonObject(
  text: string,
): string | null {
  const start = text.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function parseModelResponse(
  text: string,
): unknown | null {
  const json = extractJsonObject(text);

  if (!json) {
    return null;
  }

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function interpretQuery(
  query: string,
  catalog: {
    categories: string[];
    locations: string[];
  },
): Promise<InterpretQueryResult> {
  const system = buildSystemPrompt(catalog);

  let result: {
    text: string;
    provider: string;
  };

  try {
    result = await runLlm({
      system,
      user: query,
    });
  } catch (error) {
    if (error instanceof AiTimeoutError) {
      return {
        ok: false,
        reason: "timeout",
      };
    }

    return {
      ok: false,
      reason: "unavailable",
    };
  }

  // First attempt.
  const raw = parseModelResponse(result.text);

  if (raw !== null) {
    const parsed = parseAiFilters(raw);

    if (parsed.ok) {
      return {
        ok: true,
        filters: parsed.data,
        provider: result.provider,
      };
    }

    return {
      ok: false,
      reason: "invalid_response",
    };
  }

  // One retry for invalid JSON.
  try {
    result = await runLlm({
      system,
      user: query,
    });
  } catch (error) {
    if (error instanceof AiTimeoutError) {
      return {
        ok: false,
        reason: "timeout",
      };
    }

    return {
      ok: false,
      reason: "unavailable",
    };
  }

  const retryRaw = parseModelResponse(
    result.text,
  );

  if (retryRaw === null) {
    return {
      ok: false,
      reason: "invalid_response",
    };
  }

  const retryParsed = parseAiFilters(retryRaw);

  if (!retryParsed.ok) {
    return {
      ok: false,
      reason: "invalid_response",
    };
  }

  return {
    ok: true,
    filters: retryParsed.data,
    provider: result.provider,
  };
}