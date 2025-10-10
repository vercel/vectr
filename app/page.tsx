import type { Metadata } from "next";
import { Suspense } from "react";
import { Dropzone } from "@/components/dropzone";
import { Header } from "@/components/header";
import { Results } from "@/components/results";
import { UploadedImagesProvider } from "@/components/uploaded-images-provider";

export const metadata: Metadata = {
  title: "vectr",
  description: "vectr",
};

const Home = () => (
  <UploadedImagesProvider>
    <Dropzone>
      <div className="container mx-auto max-w-5xl py-8">
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Results />
        </Suspense>
      </div>
    </Dropzone>
  </UploadedImagesProvider>
);

export default Home;
