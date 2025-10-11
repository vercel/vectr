import type { PutBlobResult } from "@vercel/blob";
import { uploadImage } from "./upload-image";
import { generateDescription } from "./generate-description";
import { insertImage } from "./insert-image";
import { indexImage } from "./index-image";

export async function processImage(file: File) {
  "use workflow";

  const workflowStartTime = Date.now();

  console.log(
    `[WORKFLOW] Starting image processing workflow for ${file.name}`
  );
  console.log(`[WORKFLOW] File details:`, {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  try {
    // Step 1: Upload image to Blob Storage
    console.log("[WORKFLOW] Step 1/4: Uploading image");
    const blob = await uploadImage(file);
    console.log(
      `[WORKFLOW] Step 1/4 complete. Uploaded to ${blob.downloadUrl}`
    );

    // Step 2: Generate description using AI
    console.log("[WORKFLOW] Step 2/4: Generating description");
    const text = await generateDescription(blob);
    console.log(
      `[WORKFLOW] Step 2/4 complete. Generated ${text.length} characters`
    );

    // Step 3: Insert image into database
    console.log("[WORKFLOW] Step 3/4: Inserting image into database");
    const record = await insertImage(blob, text);
    console.log(`[WORKFLOW] Step 3/4 complete. Image ID: ${record.id}`);

    // Step 4: Index in search
    console.log("[WORKFLOW] Step 4/4: Indexing in search");
    await indexImage(record.id, text);
    console.log(`[WORKFLOW] Step 4/4 complete. Image indexed successfully`);

    const workflowDuration = Date.now() - workflowStartTime;
    console.log(
      `[WORKFLOW] Successfully processed image ${file.name} in ${workflowDuration}ms`
    );

    return {
      success: true,
      imageId: record.id,
      imageUrl: blob.url,
      processingTime: workflowDuration,
    };
  } catch (error) {
    const workflowDuration = Date.now() - workflowStartTime;
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `[WORKFLOW] Failed to process image ${file.name} after ${workflowDuration}ms:`,
      message
    );

    // Re-throw to let Vercel Workflow handle it
    throw error;
  }
}
