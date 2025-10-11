/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { Search } from "@upstash/search";
import type { PutBlobResult } from "@vercel/blob";
import {
  FatalError,
  RetryableError,
  getStepMetadata,
} from "@vercel/workflow";
import { generateText, type ImagePart } from "ai";
import { NextResponse } from "next/server";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";

const upstash = Search.fromEnv();

async function generateDescription(blob: PutBlobResult) {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(
    `[${stepId}] Generating description (attempt ${attempt})...`,
    blob.downloadUrl
  );

  try {
    const imagePart: ImagePart = {
      type: "image",
      image: blob.downloadUrl,
      mediaType: blob.contentType,
    };

    const { text } = await generateText({
      model: "xai/grok-2-vision",
      system: "Describe the image in detail.",
      messages: [
        {
          role: "user",
          content: [imagePart],
        },
      ],
    });

    console.log(
      `[${stepId}] Successfully generated description at ${stepStartedAt.toISOString()}`
    );

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check for rate limiting or temporary errors
    if (
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("quota")
    ) {
      throw new RetryableError(`Rate limited: ${message}`, {
        retryAfter: "5m",
      });
    }

    // Check for invalid image or permanent errors
    if (
      message.includes("invalid image") ||
      message.includes("unsupported") ||
      message.includes("400")
    ) {
      throw new FatalError(
        `[${stepId}] Invalid image or unsupported format: ${message}`
      );
    }

    // After 5 attempts, give up
    if (attempt >= 5) {
      throw new FatalError(
        `[${stepId}] Failed to generate description after ${attempt} attempts as of ${stepStartedAt.toISOString()}: ${message}`
      );
    }

    // Otherwise, retry with exponential backoff
    throw new Error(`AI generation failed: ${message}`);
  }
}

generateDescription.maxRetries = 5;

async function insertImage(blob: PutBlobResult, text: string) {
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

async function indexImage(id: string, text: string) {
  "use step";

  const { attempt, stepStartedAt, stepId } = getStepMetadata();

  console.log(`[${stepId}] Indexing image (attempt ${attempt})...`, id);

  try {
    const index = upstash.index("images");
    const result = await index.upsert({ id, content: { text } });

    console.log(
      `[${stepId}] Successfully indexed image ${id} at ${stepStartedAt.toISOString()}`
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
      throw new FatalError(
        `[${stepId}] Invalid data for indexing: ${message}`
      );
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
}

indexImage.maxRetries = 5;

async function processBlob(blob: PutBlobResult) {
  "use workflow";

  const workflowStartTime = Date.now();

  console.log(
    `[WORKFLOW] Starting image processing workflow for ${blob.downloadUrl}`
  );
  console.log(`[WORKFLOW] Blob details:`, {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    contentType: blob.contentType,
    size: blob.size,
  });

  try {
    // Step 1: Generate description using AI
    console.log("[WORKFLOW] Step 1/3: Generating description");
    const text = await generateDescription(blob);
    console.log(
      `[WORKFLOW] Step 1/3 complete. Generated ${text.length} characters`
    );

    // Step 2: Insert image into database
    console.log("[WORKFLOW] Step 2/3: Inserting image into database");
    const record = await insertImage(blob, text);
    console.log(`[WORKFLOW] Step 2/3 complete. Image ID: ${record.id}`);

    // Step 3: Index in search
    console.log("[WORKFLOW] Step 3/3: Indexing in search");
    await indexImage(record.id, text);
    console.log(`[WORKFLOW] Step 3/3 complete. Image indexed successfully`);

    const workflowDuration = Date.now() - workflowStartTime;
    console.log(
      `[WORKFLOW] Successfully processed blob ${blob.downloadUrl} in ${workflowDuration}ms`
    );

    return {
      success: true,
      imageId: record.id,
      processingTime: workflowDuration,
    };
  } catch (error) {
    const workflowDuration = Date.now() - workflowStartTime;
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `[WORKFLOW] Failed to process blob ${blob.downloadUrl} after ${workflowDuration}ms:`,
      message
    );

    // Re-throw to let Vercel Workflow handle it
    throw error;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as PutBlobResult;

    console.log("[API] Received blob upload webhook", {
      url: body.url,
      contentType: body.contentType,
    });

    const result = await processBlob(body);

    console.log("[API] Workflow completed successfully", result);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isFatal = error instanceof FatalError;

    console.error(`[API] ${isFatal ? "Fatal" : "Retryable"} error:`, message);

    // Return appropriate status code
    // 400 for fatal errors (webhook will retry but shouldn't succeed)
    // 500 for retryable errors (webhook will retry and might succeed)
    return NextResponse.json(
      {
        error: message,
        fatal: isFatal,
      },
      { status: isFatal ? 400 : 500 }
    );
  }
}
