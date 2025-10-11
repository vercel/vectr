"use client";

import type { ListBlobResult } from "@vercel/blob";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { search } from "@/app/actions/search";
import type { Image } from "@/lib/schema";
import { Preview } from "./preview";
import { Input } from "./ui/input";
import { UploadButton } from "./upload-button";
import { useUploadedImages } from "./uploaded-images-provider";

type ResultsClientProps = {
  defaultData: ListBlobResult["blobs"];
};

export const ResultsClient = ({ defaultData }: ResultsClientProps) => {
  const { images } = useUploadedImages();
  const [data, setData] = useState<Image[]>([]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const query = formData.get("search");

    if (!query || typeof query !== "string") {
      toast.error("Please enter a search query");
      return;
    }

    try {
      const response = await search(query);

      if ("error" in response) {
        throw new Error(response.error);
      }

      setData(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      toast.error(message);
    }
  };

  return (
    <>
      <div className="columns-3 gap-4">
        {images.map((image) => (
          <Preview key={image.url} url={image.url} />
        ))}
        {data.length
          ? data.map((blob) => <Preview key={blob.url} url={blob.url} />)
          : defaultData.map((blob) => (
              <Preview key={blob.url} url={blob.downloadUrl} />
            ))}
      </div>

      <form
        className="-translate-x-1/2 fixed bottom-8 left-1/2 flex w-full max-w-xl items-center gap-1 rounded-full bg-background p-1 shadow-xl"
        onSubmit={handleSubmit}
      >
        <Input
          className="w-full rounded-full border-none bg-secondary shadow-none outline-none"
          id="search"
          name="search"
          placeholder="Search by description"
        />
        <UploadButton />
      </form>
    </>
  );
};
