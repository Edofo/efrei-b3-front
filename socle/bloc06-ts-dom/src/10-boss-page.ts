/* Quest 10 · BOSS · The page comes alive
   Everything is imported: you assemble. app.ts calls start(document, "/data/catalogue.json"). */
import type { Catalogue } from "./types.ts";
import { mountRows } from "./04-fill.ts";
import { bindSearch, bindProfileMenu, bindArrows } from "./06-events.ts";
import { bindSelection } from "./07-delegation.ts";
import { loadCatalogue, withTimeout } from "./09-fetch.ts";

export function mountPage(root: ParentNode, catalogue: Catalogue): void {
  // TODO
}

export async function start(root: ParentNode, url: string, { timeout = 5000 } = {}): Promise<void> {
  // TODO
}
