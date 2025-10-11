/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  console.log("Uploading blob...", body);

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // biome-ignore lint/suspicious/useAwait: "onBeforeGenerateToken is async"
      onBeforeGenerateToken: async () => {
        console.log("Running onBeforeGenerateToken...");

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          allowOverwrite: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
