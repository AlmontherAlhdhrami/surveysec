import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // Ensures assets load correctly in production
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 3000,
    strictPort: true, // Prevents switching to a different port if 3000 is in use
    allowedHosts: ["surveysec.onrender.com"], // ✅ Correct placement
  },
  preview: {
    port: 4173,
  },
});
