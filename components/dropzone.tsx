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

  const handleDrop = (acceptedFiles: File[]) => {
    try {
      for (const file of acceptedFiles) {
        // Create a temporary blob URL and add to state immediately
        const tempUrl = URL.createObjectURL(file);
        const tempBlob = {
          url: tempUrl,
          downloadUrl: tempUrl,
          pathname: file.name,
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        };

        addImage(tempBlob);

        // Upload in the background
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        }).catch((error) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          toast.error("Failed to upload files", { description: message });
          URL.revokeObjectURL(tempUrl);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      toast.error("Failed to upload files", { description: message });
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
