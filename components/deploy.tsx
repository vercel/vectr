import Image from "next/image";

export const DeployButton = () => {
  const url = new URL("https://vercel.com/new/clone");

  // Demo
  url.searchParams.set(
    "demo-description",
    "A free, open-source template for building natural language image search on the AI Cloud."
  );
  url.searchParams.set("demo-image", "https://vectr.store/opengraph-image.png");
  url.searchParams.set("demo-title", "vectr.store");
  url.searchParams.set("demo-url", "https://vectr.store/");

  // Marketplace
  url.searchParams.set("from", "templates");
  url.searchParams.set("project-name", "Vectr");

  // Repository
  url.searchParams.set("repository-name", "vectr");
  url.searchParams.set("repository-url", "https://github.com/vercel/vectr");

  // Integrations
  url.searchParams.set(
    "products",
    JSON.stringify([
      {
        type: "integration",
        protocol: "storage",
        productSlug: "upstash-search",
        integrationSlug: "upstash",
      },
      { type: "blob" },
    ])
  );
  url.searchParams.set("skippable-integrations", "0");

  return (
    <a href={url.toString()}>
      <Image
        alt="Deploy with Vercel"
        height={32}
        src="https://vercel.com/button"
        unoptimized
        width={103}
      />
    </a>
  );
};
