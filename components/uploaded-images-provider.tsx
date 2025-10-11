"use client";

import type { PutBlobResult } from "@vercel/blob";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type UploadedImagesContextValue = {
  images: PutBlobResult[];
  addImage: (image: PutBlobResult) => void;
};

const UploadedImagesContext = createContext<
  UploadedImagesContextValue | undefined
>(undefined);

export const useUploadedImages = () => {
  const ctx = useContext(UploadedImagesContext);
  if (!ctx) {
    throw new Error(
      "useUploadedImages must be used within an UploadedImagesProvider"
    );
  }
  return ctx;
};

type UploadedImagesProviderProps = {
  children: ReactNode;
};

export const UploadedImagesProvider = ({
  children,
}: UploadedImagesProviderProps) => {
  const [images, setImages] = useState<PutBlobResult[]>([]);

  const addImage = useCallback(
    (image: PutBlobResult) => setImages((prev) => [image, ...prev]),
    []
  );

  const value = useMemo(() => ({ images, addImage }), [images, addImage]);

  return (
    <UploadedImagesContext.Provider value={value}>
      {children}
    </UploadedImagesContext.Provider>
  );
};
