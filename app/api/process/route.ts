/** biome-ignore-all lint/suspicious/noConsole: "Handy for debugging" */

import { Search } from "@upstash/search";
import type { PutBlobResult } from "@vercel/blob";
import { generateText, type ImagePart } from "ai";
import { NextResponse } from "next/server";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";

const upstash = Search.fromEnv();

const insertImage = async (blob: PutBlobResult, text: string) => {
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
};

const generateDescription = async (blob: PutBlobResult) => {
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
};

const indexImage = async (id: string, text: string) => {
  console.log("Indexing image...", id, text);
  const index = upstash.index("images");

  return await index.upsert({ id, content: { text } });
};

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as PutBlobResult;

  console.log("Processing blob...", body);

  try {
    console.log("Running onUploadCompleted...", body.downloadUrl);

    try {
      const text = await generateDescription(body);
      const record = await insertImage(body, text);
      await indexImage(record.id, text);

      console.log("Successfully processed blob.", body.downloadUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      throw new Error(message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
