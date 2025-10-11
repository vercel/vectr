"use client";

import { ImageUpIcon, XIcon } from "lucide-react";
import { type ChangeEventHandler, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadedImages } from "@/components/uploaded-images-provider";

export const UploadButton = () => {
  const { addImage } = useUploadedImages();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDemo =
    typeof window !== "undefined" &&
    window.location.hostname.includes("vectr.store");

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      toast.info("Upload cancelled");
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (isDemo) {
      toast.error("Uploads are disabled in demo mode");
      return;
    }

    // Check file sizes
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} file${oversizedFiles.length > 1 ? "s" : ""} exceed the 4.5MB limit`,
        {
          description: "Please use smaller files for server uploads",
        }
      );
      return;
    }

    // Create a new AbortController for this upload batch
    abortControllerRef.current = new AbortController();

    setIsUploading(true);

    // Create temporary blobs for all files immediately for optimistic UI
    const tempBlobs = files.map((file) => {
      const tempUrl = URL.createObjectURL(file);
      return {
        file,
        tempUrl,
        blob: {
          url: tempUrl,
          downloadUrl: tempUrl,
          pathname: file.name,
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        },
      };
    });

    // Add all temp blobs to state immediately
    for (const { blob } of tempBlobs) {
      addImage(blob);
    }

    // Show progress toast with custom UI and cancel button
    let completed = 0;
    const total = tempBlobs.length;

    const toastId = toast(
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">
            Uploading {total} file{total > 1 ? "s" : ""}...
          </div>
          <Button
            className="size-6"
            onClick={cancelUpload}
            size="icon"
            variant="ghost"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Progress className="flex-1" value={(completed / total) * 100} />
          <span className="text-muted-foreground text-xs">
            {completed}/{total}
          </span>
        </div>
      </div>,
      { duration: Number.POSITIVE_INFINITY }
    );

    // Helper function to process a single file
    const processFile = async ({
      file,
      tempUrl,
    }: {
      file: File;
      tempUrl: string;
    }) => {
      try {
        // Create FormData and upload to server
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const error = (await response.json()) as { error: string };
          throw new Error(error.error);
        }

        return { success: true, fileName: file.name };
      } catch (error) {
        // Check if the error is due to abort
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload cancelled");
        }

        throw error;
      } finally {
        // Revoke temp URL
        URL.revokeObjectURL(tempUrl);
      }
    };

    // Process uploads in batches of 10
    const BATCH_SIZE = 10;
    const results: PromiseSettledResult<{
      success: boolean;
      fileName: string;
    }>[] = [];

    try {
      for (let i = 0; i < tempBlobs.length; i += BATCH_SIZE) {
        // Check if upload was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const batch = tempBlobs.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch.map(processFile));

        results.push(...batchResults);
        completed += batch.length;

        // Update progress toast
        toast(
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">
                Uploading {total} file{total > 1 ? "s" : ""}...
              </div>
              <Button
                className="size-6"
                onClick={cancelUpload}
                size="icon"
                variant="ghost"
              >
                <XIcon className="size-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Progress className="flex-1" value={(completed / total) * 100} />
              <span className="text-muted-foreground text-xs">
                {completed}/{total}
              </span>
            </div>
          </div>,
          { id: toastId, duration: Number.POSITIVE_INFINITY }
        );
      }
    } finally {
      // Clean up
      abortControllerRef.current = null;

      // Dismiss progress toast
      toast.dismiss(toastId);

      // Show consolidated toast notifications
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      if (successful.length > 0) {
        toast.success(
          `${successful.length} file${successful.length > 1 ? "s" : ""} uploaded successfully`
        );
      }

      if (failed.length > 0) {
        const firstError = failed[0];
        const message =
          firstError.status === "rejected" && firstError.reason instanceof Error
            ? firstError.reason.message
            : "Unknown error";
        toast.error(
          `Failed to upload ${failed.length} file${failed.length > 1 ? "s" : ""}`,
          { description: message }
        );
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        accept="image/*"
        className="hidden"
        id="upload-input"
        multiple
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Button
        className="shrink-0 rounded-full disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isUploading || isDemo}
        onClick={() => inputRef.current?.click()}
        size="icon"
        type="button"
        variant="ghost"
      >
        <ImageUpIcon className="size-4" />
      </Button>
    </>
  );
};
