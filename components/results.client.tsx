import type { ListBlobResult } from "@vercel/blob";
import Image from "next/image";
import { useUploadedImages } from "./uploaded-images-provider";

type ResultsClientProps = {
  defaultData: ListBlobResult;
};

export const ResultsClient = ({ defaultData }: ResultsClientProps) => {
  const { images } = useUploadedImages();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <div key={image.url}>
          <Image alt={image.url} height={1000} src={image.url} width={1000} />
        </div>
      ))}
      {defaultData.blobs.map((blob) => (
        <div key={blob.url}>
          <Image
            alt={blob.downloadUrl}
            height={1000}
            src={blob.downloadUrl}
            width={1000}
          />
        </div>
      ))}
    </div>
  );
};
