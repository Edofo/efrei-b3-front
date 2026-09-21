/* Quest 10 · BOSS · The catalogue API
   The cards come from quest 4: toCard is imported here. */
import type { Catalogue, SearchRequest, SearchResponse } from "./types.ts";
import { toCard } from "./04-transform.ts";

export function respond(
  catalogue: Readonly<Catalogue>,
  request: SearchRequest = {},
): SearchResponse {
  // TODO
}
