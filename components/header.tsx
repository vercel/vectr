import { CheckCircle2Icon, ImageUpIcon } from "lucide-react";
import { DeployButton } from "./deploy";

export const Header = () => (
  <div className="flex flex-col gap-12">
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ImageUpIcon className="size-4" />
        <h1 className="font-semibold tracking-tight">vectr.store</h1>
      </div>
      <p className="text-balance text-muted-foreground">
        A free, open-source template for building natural language image search
        on the AI Cloud.
      </p>
    </div>
    <ul className="flex flex-col gap-4 text-muted-foreground">
      <li className="flex gap-2">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">Uploads images to Vercel Blob Storage</p>
      </li>
      <li className="flex gap-2">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">
          Generates descriptions using Grok 2 Vision AI through the AI SDK +
          Gateway
        </p>
      </li>
      <li className="flex gap-2">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">Indexes descriptions in Upstash Vector Search</p>
      </li>
      <li className="flex gap-2">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">Uses Vercel Workflow for resilient processing</p>
      </li>
    </ul>
    <DeployButton />
  </div>
);
