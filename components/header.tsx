import { ImageUpIcon } from "lucide-react";
import { DeployButton } from "./deploy";

export const Header = () => (
  <div className="flex items-center justify-between gap-4 py-2">
    <div className="flex items-center gap-2">
      <ImageUpIcon className="size-4" />
      <h1 className="font-semibold tracking-tight">vectr.store</h1>
    </div>
    <DeployButton />
  </div>
);
