/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import type { PutBlobResult } from "@vercel/blob";
import { FatalError } from "@vercel/workflow";
import { NextResponse } from "next/server";
import { processBlob } from "./process-blob";

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
