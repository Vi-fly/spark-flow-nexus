import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const port = parseInt(process.env.PORT || "3000", 10);

  return {
    server: {
      host: "0.0.0.0",
      port,
    },
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
    // Optional: if you run into memory or bundle size issues,
    // you can tweak build settings here
    build: {
      // outDir: 'dist',
      // emptyOutDir: false,
      // rollupOptions: { external: [...] },
    },
  };
});
