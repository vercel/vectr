import { Search } from "@upstash/search";
import type { PutBlobResult } from "@vercel/blob";
import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { generateText, type ImagePart } from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { database } from "@/lib/database";
import { image } from "@/lib/schema";

const upstash = Search.fromEnv();

const insertImage = async (blob: PutBlobResult) => {
  const [record] = await database
    .insert(image)
    .values({
      downloadUrl: blob.downloadUrl,
      url: blob.url,
      mediaType: blob.contentType,
    })
    .returning({ id: image.id });

  return record;
};

const generateDescription = async (blob: PutBlobResult) => {
  const imagePart: ImagePart = {
    type: "image",
    image: blob.url,
    mediaType: blob.contentType,
  };

  const { text } = await generateText({
    model: "meta/llama-3.2-90b",
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
  const index = upstash.index("images");
  await index.upsert({ id, content: { text } });
};

const updateImage = async (id: string, text: string) =>
  await database.update(image).set({ text }).where(eq(image.id, id));

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        try {
          const [record, text] = await Promise.all([
            insertImage(blob),
            generateDescription(blob),
          ]);

          await Promise.all([
            updateImage(record.id, text),
            indexImage(record.id, text),
          ]);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          throw new Error(message);
        }
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
