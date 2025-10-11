import Image from "next/image";

type PreviewProps = {
  url: string;
};

export const Preview = ({ url }: PreviewProps) => (
  <div className="mb-4 rounded-xl bg-card p-2 shadow-xl">
    <Image
      alt={url}
      className="rounded-md"
      height={1000}
      src={url}
      width={1000}
    />
  </div>
);
