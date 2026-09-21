#!/usr/bin/env node
/* The game. Run it with `npm run play` (= `node --watch play.ts`):
   it replays the tests every time you save a file. */
import { playInTerminal } from "./engine/terminal.ts";

await playInTerminal(import.meta.url);
