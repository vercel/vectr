/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { Search } from "@upstash/search";
import type { PutBlobResult } from "@vercel/blob";
import { FatalError, getStepMetadata, RetryableError } from "workflow";

const upstash = Search.fromEnv();

export const indexImage = async (blob: PutBlobResult, text: string) => {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(
    `[${stepId}] Indexing image (attempt ${attempt})...`,
    blob.downloadUrl
  );

  try {
    const index = upstash.index("images");

    // Store blob metadata in Upstash along with the description
    const result = await index.upsert({
      id: blob.pathname,
      content: { text },
      metadata: { ...blob },
    });

    console.log(
      `[${stepId}] Successfully indexed image at ${stepStartedAt.toISOString()}`
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for rate limiting
    if (
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("quota")
    ) {
      throw new RetryableError(`Upstash rate limited: ${message}`, {
        retryAfter: "1m",
      });
    }

    // Check for network/connection errors
    if (
      message.includes("timeout") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT") ||
      message.includes("network")
    ) {
      throw new RetryableError(`Network error: ${message}`, {
        retryAfter: "30s",
      });
    }

    // Check for invalid data (fatal)
    if (message.includes("invalid") || message.includes("400")) {
      throw new FatalError(`[${stepId}] Invalid data for indexing: ${message}`);
    }

    // After 5 attempts for search indexing, give up
    if (attempt >= 5) {
      throw new FatalError(
        `[${stepId}] Failed to index image after ${attempt} attempts as of ${stepStartedAt.toISOString()}: ${message}`
      );
    }

    // Otherwise, retry
    throw new Error(`Search indexing failed: ${message}`);
  }
};

indexImage.maxRetries = 5;
