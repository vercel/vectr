import type { PutBlobResult } from "@vercel/blob";
import { generateDescription } from "./generate-description";
import { insertImage } from "./insert-image";
import { indexImage } from "./index-image";

export async function processBlob(blob: PutBlobResult) {
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
