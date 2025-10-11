"use client";

import type { ListBlobResult } from "@vercel/blob";
import Image from "next/image";
import { Input } from "./ui/input";
import { UploadButton } from "./upload-button";
import { useUploadedImages } from "./uploaded-images-provider";

type ResultsClientProps = {
  defaultData: ListBlobResult;
};

export const ResultsClient = ({ defaultData }: ResultsClientProps) => {
  const { images } = useUploadedImages();

  return (
    <>
      <div className="columns-3 gap-4">
        {images.map((image) => (
          <div
            className="mb-4 rounded-xl bg-card p-2 shadow-xl"
            key={image.url}
          >
            <Image
              alt={image.url}
              className="rounded-md"
              height={1000}
              src={image.url}
              width={1000}
            />
          </div>
        ))}
        {defaultData.blobs.map((blob) => (
          <div className="mb-4 rounded-xl bg-card p-2 shadow-xl" key={blob.url}>
            <Image
              alt={blob.downloadUrl}
              className="rounded-md"
              height={1000}
              src={blob.downloadUrl}
              width={1000}
            />
          </div>
        ))}
      </div>

      <div className="-translate-x-1/2 fixed bottom-8 left-1/2 flex w-full max-w-2xl items-center gap-2 rounded-full bg-background p-1">
        <Input
          className="w-full rounded-full border-none bg-secondary shadow-none outline-none"
          placeholder="Search by description"
        />
        <UploadButton />
      </div>
    </>
  );
};
