/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { FatalError } from "workflow";
import { generateDescription } from "./generate-description";
import { indexImage } from "./index-image";
import { uploadImage } from "./upload-image";

type SerializableFile = {
  buffer: ArrayBuffer;
  name: string;
  type: string;
  size: number;
};

export const processImage = async (fileData: SerializableFile) => {
  "use workflow";

  const workflowStartTime = Date.now();

  try {
    console.log(
      `[WORKFLOW] Starting image processing workflow for ${fileData.name}`
    );
    console.log("[WORKFLOW] File details:", {
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
    });

    // Step 1: Upload image to Blob Storage
    console.log("[WORKFLOW] Step 1/3: Uploading image");
    const blob = await uploadImage(fileData);
    console.log(
      `[WORKFLOW] Step 1/3 complete. Uploaded to ${blob.downloadUrl}`
    );

    // Step 2: Generate description using AI
    console.log("[WORKFLOW] Step 2/3: Generating description");
    const text = await generateDescription(blob);
    console.log(
      `[WORKFLOW] Step 2/3 complete. Generated ${text.length} characters`
    );

    // Step 3: Index in search with metadata
    console.log("[WORKFLOW] Step 3/3: Indexing in search");
    await indexImage(blob, text);
    console.log("[WORKFLOW] Step 3/3 complete. Image indexed successfully");

    const workflowDuration = Date.now() - workflowStartTime;
    console.log(
      `[WORKFLOW] Successfully processed image ${fileData.name} in ${workflowDuration}ms`
    );

    return {
      success: true,
      pathname: blob.pathname,
      imageUrl: blob.url,
      processingTime: workflowDuration,
    };
  } catch (error) {
    const workflowDuration = Date.now() - workflowStartTime;
    const message = error instanceof Error ? error.message : "Unknown error";
    const isFatal = error instanceof FatalError;

    console.error(
      `[WORKFLOW] ${isFatal ? "Fatal" : "Retryable"} error after ${workflowDuration}ms:`,
      message
    );

    throw error;
  }
};
