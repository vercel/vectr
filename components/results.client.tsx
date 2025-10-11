"use client";

import type { ListBlobResult } from "@vercel/blob";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { search } from "@/app/actions/search";
import { Preview } from "./preview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UploadButton } from "./upload-button";
import { useUploadedImages } from "./uploaded-images-provider";

type ResultsClientProps = {
  defaultData: ListBlobResult["blobs"];
};

const PRIORITY_COUNT = 12;

export const ResultsClient = ({ defaultData }: ResultsClientProps) => {
  const { images } = useUploadedImages();
  const [state, formAction, isPending] = useActionState(search, { data: [] });

  useEffect(() => {
    if ("error" in state) {
      toast.error(state.error);
    }
  }, [state]);

  const reset = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="columns-3 gap-4">
        {images.map((image, index) => (
          <Preview
            key={image.url}
            priority={index < PRIORITY_COUNT}
            url={image.url}
          />
        ))}
        {"data" in state && state.data?.length
          ? state.data.map((blob, index) => (
              <Preview
                key={blob.url}
                priority={index < PRIORITY_COUNT}
                url={blob.url}
              />
            ))
          : defaultData.map((blob, index) => (
              <Preview
                key={blob.url}
                priority={index < PRIORITY_COUNT}
                url={blob.downloadUrl}
              />
            ))}
      </div>

      <form
        action={formAction}
        className="-translate-x-1/2 fixed bottom-8 left-1/2 flex w-full max-w-lg items-center gap-1 rounded-full bg-background p-1 shadow-xl"
      >
        {"data" in state && state.data.length > 0 && (
          <Button
            className="shrink-0 rounded-full"
            disabled={isPending}
            onClick={reset}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
        )}
        <Input
          className="w-full rounded-full border-none bg-secondary shadow-none outline-none"
          disabled={isPending}
          id="search"
          name="search"
          placeholder="Search by description"
          required
        />
        {isPending ? (
          <Button className="shrink-0" disabled size="icon" variant="ghost">
            <Loader2Icon className="size-4 animate-spin" />
          </Button>
        ) : (
          <UploadButton />
        )}
      </form>
    </>
  );
};
