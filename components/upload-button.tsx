"use client";

import { upload } from "@vercel/blob/client";
import { ImageUpIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadedImages } from "@/components/uploaded-images-provider";

export const UploadButton = () => {
  const { addImage } = useUploadedImages();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

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

    // Show progress toast with custom UI
    let completed = 0;
    const total = tempBlobs.length;

    const toastId = toast(
      <div className="flex flex-col gap-2">
        <div className="font-medium text-sm">
          Uploading {total} file{total > 1 ? "s" : ""}...
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
      const controller = new AbortController();
      try {
        // Upload the file
        const blobResult = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          abortSignal: controller.signal,
          multipart: true,
        });

        // Process the blob
        const response = await fetch("/api/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blobResult),
        });

        if (!response.ok) {
          const error = (await response.json()) as { error: string };
          throw new Error(error.error);
        }

        // Revoke temp URL on success
        URL.revokeObjectURL(tempUrl);

        return { success: true, fileName: file.name };
      } catch (error) {
        // Revoke temp URL on error
        URL.revokeObjectURL(tempUrl);
        throw error;
      }
    };

    // Process uploads in batches of 10
    const BATCH_SIZE = 10;
    const results: PromiseSettledResult<{
      success: boolean;
      fileName: string;
    }>[] = [];

    for (let i = 0; i < tempBlobs.length; i += BATCH_SIZE) {
      const batch = tempBlobs.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(batch.map(processFile));

      results.push(...batchResults);
      completed += batch.length;

      // Update progress toast
      toast(
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">
            Uploading {total} file{total > 1 ? "s" : ""}...
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
        className="rounded-full"
        onClick={() => inputRef.current?.click()}
        size="icon"
        variant="ghost"
      >
        <ImageUpIcon className="size-4" />
      </Button>
    </>
  );
};
