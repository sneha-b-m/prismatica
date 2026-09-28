import "server-only";

import type { LlmProvider } from "./index";

import { aiConfig } from "@/lib/ai/config";

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

function getOllamaUrl(): string {
  return `${aiConfig.ollama.baseUrl.replace(/\/+$/, "")}/api/chat`;
}

export const ollamaProvider: LlmProvider = {
  name: "ollama",

  async complete({ system, user, signal }): Promise<string> {
    if (!aiConfig.ollama.model) {
      throw new Error("Ollama model is not configured.");
    }

    const response = await fetch(getOllamaUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: aiConfig.ollama.model,
        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: user,
          },
        ],
        stream: false,
        format: "json",
        options: {
          temperature: 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}.`);
    }

    let data: OllamaChatResponse;

    try {
      data = (await response.json()) as OllamaChatResponse;
    } catch {
      throw new Error("Ollama returned an invalid response.");
    }

    const content = data.message?.content;

    if (typeof content !== "string") {
      throw new Error("Ollama response did not contain message content.");
    }

    return content;
  },
};