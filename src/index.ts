import * as Players from "./Players";

import {Shikiplayer} from "./Shikiplayer";

(async function main()
{
  await Players.KodikPlayer.inject();
  new Shikiplayer();
})();