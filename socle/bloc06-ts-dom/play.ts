/* The game, in the browser. Loaded by play.html through Vite (`npm run play`). */
import { playInBrowser } from "./engine/browser.ts";

const container = document.getElementById("game");
const sandboxHost = document.getElementById("sandbox");
if (!container || !sandboxHost) throw new Error("play.html is missing #game or #sandbox");

playInBrowser({ container, sandboxHost }).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  container.innerHTML = `<p style="padding:20px;color:#ff6b6b">The game could not start: ${message}</p>`;
  console.error(error);
});
