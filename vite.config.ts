import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  VitePWA({
    registerType: "autoUpdate",
    devOptions: { enabled: true },
    manifest: {
      name: "React Offline App",
      short_name: "ReactOfflineApp",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
      icons: [
        {
          src: "/react.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/react.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "@server": path.resolve(__dirname, "../server/dist/"),
    },
  },
  server: {
    watch: {
      ignored: [],
    },
  },
});
