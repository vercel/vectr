import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Results } from "@/components/results";

export const metadata: Metadata = {
  title: "vectr",
  description: "vectr",
};

const Home = () => (
  <div className="container mx-auto max-w-5xl py-8">
    <Header />
    <Suspense fallback={<div>Loading...</div>}>
      <Results />
    </Suspense>
  </div>
);

export default Home;
