import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const functionsTarget = process.env.NETLIFY_FUNCTIONS_ORIGIN || "http://127.0.0.1:8888";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    "";
  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    "";
  const convexUrl =
    env.VITE_CONVEX_URL ||
    env.CONVEX_URL ||
    "";

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabasePublishableKey),
      "import.meta.env.VITE_CONVEX_URL": JSON.stringify(convexUrl),
    },
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["statesmanly-jerrie-unnotioned.ngrok-free.dev"],
      proxy: {
        "/.netlify/functions": {
          target: functionsTarget,
          changeOrigin: true,
        },
        "/api": {
          target: functionsTarget,
          changeOrigin: true,
        },
      },
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
