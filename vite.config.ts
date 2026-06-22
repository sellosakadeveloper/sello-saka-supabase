import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const convexUrl =
    env.VITE_CONVEX_URL ||
    env.CONVEX_URL ||
    "";

  return {
    define: {
      "import.meta.env.VITE_CONVEX_URL": JSON.stringify(convexUrl),
    },
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["statesmanly-jerrie-unnotioned.ngrok-free.dev"],
    },
    preview: {
      allowedHosts: true,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
