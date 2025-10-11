import { list } from "@vercel/blob";
import { ResultsClient } from "./results.client";

export const Results = async () => {
  const { blobs } = await list({ limit: 50 });

  return <ResultsClient defaultData={blobs} />;
};
