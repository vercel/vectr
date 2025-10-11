"use client";

import { upload } from "@vercel/blob/client";
import { FileIcon, ImageIcon, UploadIcon } from "lucide-react";
import type { ReactNode } from "react";
import DropzoneComponent from "react-dropzone";
import { toast } from "sonner";
import { useUploadedImages } from "@/components/uploaded-images-provider";

type DropzoneProps = {
  children: ReactNode;
};

export const Dropzone = ({ children }: DropzoneProps) => {
  const { addImage } = useUploadedImages();

  const handleDrop = async (acceptedFiles: File[]) => {
    // Create temporary blobs for all files immediately for optimistic UI
    const tempBlobs = acceptedFiles.map((file) => {
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

    // Process all uploads in parallel
    const results = await Promise.allSettled(
      tempBlobs.map(async ({ file, tempUrl }) => {
        try {
          // Upload the file
          const blobResult = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
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
      })
    );

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
  };

  return (
    <DropzoneComponent noClick noKeyboard onDrop={handleDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div {...getRootProps()} className="h-screen w-screen">
          <input {...getInputProps()} />
          {isDragActive && (
            <div className="pointer-events-none fixed inset-0 flex select-none flex-col items-center justify-center gap-4 bg-black/50 text-white">
              <div className="relative isolate flex">
                <div className="-rotate-12 translate-x-2 translate-y-2 rounded-full border bg-background p-3 shadow-xs">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="z-10 rounded-full border bg-background p-3 shadow-xs">
                  <UploadIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="-translate-x-2 translate-y-2 rotate-12 rounded-full border bg-background p-3 shadow-xs">
                  <FileIcon className="size-5 text-muted-foreground" />
                </div>
              </div>
              <p className="font-medium text-lg">Drop the files here...</p>
            </div>
          )}
          {children}
        </div>
      )}
    </DropzoneComponent>
  );
};
