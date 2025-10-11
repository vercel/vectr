import type { PutBlobResult } from "@vercel/blob";
import {
  FatalError,
  RetryableError,
  getStepMetadata,
} from "@vercel/workflow";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";

export async function insertImage(blob: PutBlobResult, text: string) {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(
    `[${stepId}] Inserting image (attempt ${attempt})...`,
    blob.downloadUrl
  );

  try {
    const [record] = await database
      .insert(image)
      .values({
        downloadUrl: blob.downloadUrl,
        url: blob.url,
        mediaType: blob.contentType,
        text,
      })
      .returning({ id: image.id });

    console.log(
      `[${stepId}] Successfully inserted image with ID ${record.id} at ${stepStartedAt.toISOString()}`
    );

    return record;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for connection/timeout errors (retryable)
    if (
      message.includes("timeout") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT") ||
      message.includes("connection")
    ) {
      throw new RetryableError(`Database connection issue: ${message}`, {
        retryAfter: "30s",
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

    // After 3 attempts for database operations, give up
    if (attempt >= 3) {
      throw new FatalError(
        `[${stepId}] Failed to insert image after ${attempt} attempts as of ${stepStartedAt.toISOString()}: ${message}`
      );
    }

    // Otherwise, retry
    throw new Error(`Database insertion failed: ${message}`);
  }
}

insertImage.maxRetries = 3;
