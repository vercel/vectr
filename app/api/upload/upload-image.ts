/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { put } from "@vercel/blob";
import { FatalError, getStepMetadata, RetryableError } from "workflow";

type SerializableFile = {
  buffer: ArrayBuffer;
  name: string;
  type: string;
  size: number;
};

export const uploadImage = async (fileData: SerializableFile) => {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(
    `[${stepId}] Uploading image (attempt ${attempt})...`,
    fileData.name
  );

  try {
    const blob = await put(fileData.name, fileData.buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: fileData.type,
    });

    console.log(
      `[${stepId}] Successfully uploaded image ${fileData.name} at ${stepStartedAt.toISOString()}`,
      blob.url
    );

    return blob;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for rate limiting
    if (
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("quota")
    ) {
      throw new RetryableError(`Blob storage rate limited: ${message}`, {
        retryAfter: "1m",
      });
    }

    // Check for storage quota errors
    if (
      message.includes("quota exceeded") ||
      message.includes("storage full")
    ) {
      throw new FatalError(`[${stepId}] Storage quota exceeded: ${message}`);
    }

    // Check for invalid file errors
    if (
      message.includes("invalid file") ||
      message.includes("unsupported") ||
      message.includes("400")
    ) {
      throw new FatalError(
        `[${stepId}] Invalid file type or format: ${message}`
      );
    }

    // After 3 attempts for upload operations, give up
    if (attempt >= 3) {
      throw new FatalError(
        `[${stepId}] Failed to upload image after ${attempt} attempts as of ${stepStartedAt.toISOString()}: ${message}`
      );
    }

    // Otherwise, retry
    throw new Error(`Image upload failed: ${message}`);
  }
};

uploadImage.maxRetries = 3;
