/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { FatalError } from "@vercel/workflow";
import { NextResponse } from "next/server";
import { processImage } from "../process/process-blob";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` },
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

    console.log("[API] Received file upload", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const result = await processImage(file);

    console.log("[API] Workflow completed successfully", result);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isFatal = error instanceof FatalError;

    console.error(`[API] ${isFatal ? "Fatal" : "Retryable"} error:`, message);

    return NextResponse.json(
      {
        error: message,
        fatal: isFatal,
      },
      { status: isFatal ? 400 : 500 }
    );
  }
}
