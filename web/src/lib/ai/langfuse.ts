import { observeOpenAI } from "langfuse";
import type OpenAI from "openai";
import { getOpenAI } from "./openai";

type FlushableOpenAI = OpenAI & {
  flushAsync?: () => Promise<void>;
};

interface ObservedOpenAIConfig {
  traceId?: string;
  traceName?: string;
  generationName?: string;
  sessionId?: string;
  userId?: string;
  release?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

function getLangfuseClientInitParams() {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;

  if (!publicKey || !secretKey) {
    return null;
  }

  return {
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASEURL ?? process.env.LANGFUSE_BASE_URL,
  };
}

export function getObservedOpenAI(config?: ObservedOpenAIConfig): FlushableOpenAI {
  const clientInitParams = getLangfuseClientInitParams();
  if (!clientInitParams) {
    return getOpenAI() as FlushableOpenAI;
  }

  return observeOpenAI(getOpenAI(), {
    ...config,
    clientInitParams,
  }) as FlushableOpenAI;
}

export async function flushObservedOpenAI(client: FlushableOpenAI) {
  if (typeof client.flushAsync === "function") {
    await client.flushAsync();
  }
}
