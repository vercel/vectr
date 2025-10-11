/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { FatalError } from "@vercel/workflow";
import { NextResponse } from "next/server";
import { generateDescription } from "./generate-description";
import { indexImage } from "./index-image";
import { uploadImage } from "./upload-image";

export async function POST(request: Request): Promise<NextResponse> {
  "use workflow";

  const workflowStartTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size (4.5MB limit for server uploads)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 4.5MB limit for server uploads" },
        { status: 400 }
      );
    }

    console.log(
      `[WORKFLOW] Starting image processing workflow for ${file.name}`
    );
    console.log("[WORKFLOW] File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Step 1: Upload image to Blob Storage
    console.log("[WORKFLOW] Step 1/3: Uploading image");
    const blob = await uploadImage(file);
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
      `[WORKFLOW] Successfully processed image ${file.name} in ${workflowDuration}ms`
    );

    return NextResponse.json({
      success: true,
      pathname: blob.pathname,
      imageUrl: blob.url,
      processingTime: workflowDuration,
    });
  } catch (error) {
    const workflowDuration = Date.now() - workflowStartTime;
    const message = error instanceof Error ? error.message : "Unknown error";
    const isFatal = error instanceof FatalError;

    console.error(
      `[WORKFLOW] ${isFatal ? "Fatal" : "Retryable"} error after ${workflowDuration}ms:`,
      message
    );

    return NextResponse.json(
      {
        error: message,
        fatal: isFatal,
      },
      { status: isFatal ? 400 : 500 }
    );
  }
}
