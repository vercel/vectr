import type { ListBlobResult } from "@vercel/blob";
import Image from "next/image";

type ResultsClientProps = {
  defaultData: ListBlobResult;
};

export const ResultsClient = ({ defaultData }: ResultsClientProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
