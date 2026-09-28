import "server-only";

import type { LlmProvider } from "./index";

import { aiConfig } from "@/lib/ai/config";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getChatCompletionsUrl(): string {
  return `${aiConfig.api.baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

export const apiProvider: LlmProvider = {
  name: "api",

  async complete({ system, user, signal }): Promise<string> {
    if (
      !aiConfig.api.baseUrl ||
      !aiConfig.api.apiKey ||
      !aiConfig.api.model
    ) {
      throw new Error("API provider is not configured.");
    }

    const response = await fetch(getChatCompletionsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.api.apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: aiConfig.api.model,
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
        temperature: 0,
        response_format: {
          type: "json_object",
        },
      }),
    });

    if (!response.ok) {
      // Do not include response body here.
      // It could contain sensitive provider information.
      throw new Error(
        `API provider request failed with status ${response.status}.`,
      );
    }

    let data: ChatCompletionResponse;

    try {
      data = (await response.json()) as ChatCompletionResponse;
    } catch {
      throw new Error("API provider returned an invalid response.");
    }

    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error("API provider response did not contain message content.");
    }

    return content;
  },
};