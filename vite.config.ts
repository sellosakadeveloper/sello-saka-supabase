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
  const netlifyFunctionsOrigin = env.VITE_NETLIFY_FUNCTIONS_ORIGIN || "";

  return {
    define: {
      "import.meta.env.VITE_CONVEX_URL": JSON.stringify(convexUrl),
    },
    server: {
      host: "127.0.0.1",
      port: 8080,
      allowedHosts: ["localhost", "127.0.0.1", "statesmanly-jerrie-unnotioned.ngrok-free.dev"],
      proxy: netlifyFunctionsOrigin
        ? {
            "/.netlify/functions": {
              target: netlifyFunctionsOrigin,
              changeOrigin: true,
            },
          }
        : undefined,
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
