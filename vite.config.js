import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 3000,
    strictPort: true,
    allowedHosts: ["surveysec.onrender.com"],
  },
  preview: {
    port: 4173,
  },
  esbuild: {
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    loader: "jsx", // ✅ Enables JSX support in .js files
  },
});
