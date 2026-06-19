import { ConvexReactClient } from "convex/react";

const CONVEX_URL =
  import.meta.env.VITE_CONVEX_URL ||
  import.meta.env.CONVEX_URL ||
  "";

if (!CONVEX_URL) {
  throw new Error("Missing Convex configuration. Set VITE_CONVEX_URL in the build environment.");
}

export const convex = new ConvexReactClient(CONVEX_URL);
