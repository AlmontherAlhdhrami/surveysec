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
  },
  preview: {
    allowedHosts: ["https://surveysec.onrender.com"],
  },
});
