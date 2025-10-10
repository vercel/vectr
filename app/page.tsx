import { list } from "@vercel/blob";
import { Results } from "@/components/results";

const Home = async () => {
  const blobs = await list({ limit: 50 });

  return <Results defaultData={blobs} />;
};

export default Home;
