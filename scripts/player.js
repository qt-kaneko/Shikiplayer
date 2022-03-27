// This file is part of Shikiplayer.
//
// Shikiplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Shikiplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Shikiplayer. If not, see <https://www.gnu.org/licenses/>.
// Copyright 2022 Kaneko Qt

/*import { shikimori } from "./helpers/shikimori.js";*/
/*import { helpers } from "./helpers/helpers.js";*/

(function () {
  const match = shikimori.isAnimePage(window.location.pathname);
  if (match) {
    const animeId = match.groups.id;

    const episode = shikimori.getWatchingEpisode(animeId);

    const player = createPlayer();
    player.animeId = animeId;
    player.src = `//kodik.cc/find-player?shikimoriID=${player.animeId}` +
                                       `&episode=${episode}`;

    const options = createOptions(player);

    const subheadline = createSubheadline();

    const block = createBlock(options, subheadline, player);

    const before = document.getElementsByClassName("b-db_entry")[0];

    helpers.insertAfter(block, before);
  }

  function createOptions(player) {
    const options = document.createElement("div");
    options.classList = "b-options-floated mobile-phone";

    const kodik = document.createElement("a");
    kodik.text = "Kodik";
    kodik.onclick = () => player.src = `//kodik.cc/find-player?shikimoriID=${player.animeId}` +
                                                             `&episode=${shikimori.getWatchingEpisode(player.animeId)}`;
    options.appendChild(kodik);

    return options;
  }

  function createSubheadline() {
    const subheadline = document.createElement("div");
    subheadline.className = "subheadline";
    subheadline.appendChild(document.createTextNode("смотреть"))

    return subheadline;
  }

  function createPlayer() {
    const player = document.createElement("iframe");
    player.width = "100%";
    player.scrolling = "no";
    player.allowFullscreen = true;

    new ResizeObserver(() => {
      player.height = 9 * player.clientWidth / 16 // Calculate to fit 16:9
    }).observe(player);

    return player;
  }

  function createBlock(options, subheadline, player) {
    const block = document.createElement("div");
    block.className = "block";

    block.appendChild(options);

    block.appendChild(subheadline);

    block.appendChild(player);

    return block;
  }
})();
