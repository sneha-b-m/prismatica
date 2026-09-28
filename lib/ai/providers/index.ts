import "server-only";

export interface LlmProvider {
  name: string;

  complete(args: {
    system: string;
    user: string;
    signal: AbortSignal;
  }): Promise<string>;
}