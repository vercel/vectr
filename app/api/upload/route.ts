import { NextResponse } from "next/server";
import { FatalError } from "workflow";
import { start } from "workflow/api";
import { processImage } from "./process-image";

export const POST = async (request: Request): Promise<NextResponse> => {
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

    // Convert File to serializable format for the workflow
    const arrayBuffer = await file.arrayBuffer();
    const fileData = {
      buffer: arrayBuffer,
      name: file.name,
      type: file.type,
      size: file.size,
    };

    // Start the workflow in the background
    const result = await start(processImage, [fileData]);

    return NextResponse.json({
      success: true,
      runId: result.runId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isFatal = error instanceof FatalError;

    return NextResponse.json(
      {
        error: message,
        fatal: isFatal,
      },
      { status: isFatal ? 400 : 500 }
    );
  }
};
