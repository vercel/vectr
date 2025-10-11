import type { PutBlobResult } from "@vercel/blob";
import {
  FatalError,
  RetryableError,
  getStepMetadata,
} from "@vercel/workflow";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";
import { Search } from "@upstash/search";

const upstash = Search.fromEnv();

export async function saveImage(blob: PutBlobResult, text: string) {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(
    `[${stepId}] Saving image to database and search (attempt ${attempt})...`,
    blob.downloadUrl
  );

  try {
    // Insert into database
    const [record] = await database
      .insert(image)
      .values({
        downloadUrl: blob.downloadUrl,
        url: blob.url,
        mediaType: blob.contentType,
        text,
      })
      .returning({ id: image.id });

    console.log(`[${stepId}] Inserted image with ID ${record.id}`);

    // Index in search
    const index = upstash.index("images");
    await index.upsert({ id: record.id, content: { text } });

    console.log(
      `[${stepId}] Successfully saved and indexed image at ${stepStartedAt.toISOString()}`
    );

    return record;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for connection/timeout errors (retryable)
    if (
      message.includes("timeout") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT") ||
      message.includes("connection") ||
      message.includes("network")
    ) {
      throw new RetryableError(`Connection issue: ${message}`, {
        retryAfter: "30s",
      });
    }

    // Check for rate limiting
    if (
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("quota")
    ) {
      throw new RetryableError(`Rate limited: ${message}`, {
        retryAfter: "1m",
      });
    }

    // Check for constraint violations (fatal - data issue)
    if (
      message.includes("unique constraint") ||
      message.includes("duplicate key") ||
      message.includes("foreign key")
    ) {
      throw new FatalError(
        `[${stepId}] Database constraint violation: ${message}`
      );
    }

    // Check for invalid data (fatal)
    if (message.includes("invalid") || message.includes("400")) {
      throw new FatalError(`[${stepId}] Invalid data: ${message}`);
    }

    // After 5 attempts, give up
    if (attempt >= 5) {
      throw new FatalError(
        `[${stepId}] Failed to save image after ${attempt} attempts as of ${stepStartedAt.toISOString()}: ${message}`
      );
    }

    // Otherwise, retry
    throw new Error(`Save operation failed: ${message}`);
  }
}

saveImage.maxRetries = 5;
