/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { Search } from "@upstash/search";
import type { PutBlobResult } from "@vercel/blob";
import { generateText, type ImagePart } from "ai";
import { NextResponse } from "next/server";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";

const upstash = Search.fromEnv();

async function generateDescription(blob: PutBlobResult) {
  "use step";

  console.log("Generating description...", blob.downloadUrl);

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

  return text;
}

async function insertImage(blob: PutBlobResult, text: string) {
  "use step";

  console.log("Inserting image...", blob.downloadUrl);

  const [record] = await database
    .insert(image)
    .values({
      downloadUrl: blob.downloadUrl,
      url: blob.url,
      mediaType: blob.contentType,
      text,
    })
    .returning({ id: image.id });

  return record;
}

async function indexImage(id: string, text: string) {
  "use step";

  console.log("Indexing image...", id, text);
  const index = upstash.index("images");

  return await index.upsert({ id, content: { text } });
}

async function processBlob(blob: PutBlobResult) {
  "use workflow";

  console.log("Processing blob...", blob.downloadUrl);

  // Each step runs on a separate serverless function with automatic retries
  const text = await generateDescription(blob);
  const record = await insertImage(blob, text);
  await indexImage(record.id, text);

  console.log("Successfully processed blob.", blob.downloadUrl);

  return { success: true };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as PutBlobResult;

    console.log("Running onUploadCompleted...", body.downloadUrl);

    const result = await processBlob(body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
