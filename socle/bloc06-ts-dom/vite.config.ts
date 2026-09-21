import { defineConfig } from "vite";

// Vite serves index.html (the real page) and play.html (the game), strips
// the types on the fly and reloads the page when a file changes.
export default defineConfig({
  server: { port: 3006, open: "/play.html" },
});
