import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "Madrasa",
        short_name: "Madrasa",
        description: "Arabic learning — mobile-first",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Cache proxied page responses (lesson HTML) — stale-while-revalidate
            urlPattern: /workers\.dev/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "madrasa-lessons",
              expiration: { maxAgeSeconds: 60 * 60 * 24 }, // 24h client-side
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
