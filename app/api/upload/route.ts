import { Search } from "@upstash/search";
import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { generateText, type ImagePart } from "ai";
import { NextResponse } from "next/server";

const upstash = Search.fromEnv();

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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("blob upload completed", blob, tokenPayload);

        try {
          const record = await database.image.create({
            data: {
              downloadUrl: blob.downloadUrl,
              url: blob.url,
              mediaType: blob.contentType,
            },
            select: {
              id: true,
            },
          });

          const image: ImagePart = {
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
                content: [image],
              },
            ],
          });

          await database.image.update({
            where: { id: record.id },
            data: { text },
          });

          const index = upstash.index("images");

          await index.upsert({
            id: record.id,
            content: { text },
          });

          return NextResponse.json({
            id: record.id,
            url: blob.url,
            type: blob.contentType,
          });
        } catch (error) {
          throw new Error("Could not update user");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
