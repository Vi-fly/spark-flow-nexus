import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Render expects your app to listen on port 10000 by default,
  // but will set process.env.PORT if you change it in the dashboard.
  const port = parseInt(process.env.PORT || "10000", 10);

  return {
    // Dev server (vite dev)
    server: {
      host: "0.0.0.0",
      port,
    },
    // Preview/production server (vite preview)
    preview: {
      host: "0.0.0.0",
      port,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Optional build tweaks (e.g., to mitigate memory issues)
    build: {
      // emptyOutDir: false,
      // rollupOptions: { external: [...] },
    },
  };
});
