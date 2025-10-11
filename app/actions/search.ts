"use server";

import { Search } from "@upstash/search";
import { inArray } from "drizzle-orm";
import { database } from "@/lib/database";
import { type Image, image } from "@/lib/schema";

const upstash = Search.fromEnv();
const index = upstash.index("images");

type SearchResponse =
  | {
      data: Image[];
    }
  | {
      error: string;
    };

export const search = async (
  _prevState: SearchResponse | undefined,
  formData: FormData
): Promise<SearchResponse> => {
  const query = formData.get("search");

  if (!query || typeof query !== "string") {
    return { error: "Please enter a search query" };
  }

  try {
    console.log("Searching index for query:", query);
    const results = await index.search({ query });

    console.log("Results:", results);
    const ids = results.map((result) => result.id);

    console.log("Finding images in database:", ids);
    const data = await database
      .select()
      .from(image)
      .where(inArray(image.id, ids));

    console.log("Images found in database:", data);
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return { error: message };
  }
};
