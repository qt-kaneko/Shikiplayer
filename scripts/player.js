// This file is part of Shikiplayer.
//
// Shikiplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Shikiplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Shikiplayer. If not, see <https://www.gnu.org/licenses/>.
// Copyright 2022 Kaneko Qt

"use strict"

class Player {
  static {
    console.debug("Hello from Player!");

    document.addEventListener("turbolinks:load", () => this.#onViewChanged());
  }

  static async #onViewChanged() {
    const match = Shikimori.isAnimePage(window.location);
    if (match) {
      const animeId = match.groups.id;

      const episode = Shikimori.getWatchingEpisode(animeId);

      const player = this.#createPlayer();
      player.animeId = animeId;
      player.src = `//kodik.cc/find-player?shikimoriID=${player.animeId}` +
                                         `&episode=${episode}` +
                                         `&poster=${config.poster}`;

      const options = this.#createOptions(player);

      const headline = this.#createHeadline();

      const block = this.#createBlock(options, headline, player);

      const before = document.getElementsByClassName("b-db_entry")[0];

      Helpers.insertAfter(block, before);
    }
  }

  static #createOptions(player) {
    const options = document.createElement("div");
    options.className = "b-options-floated mobile-phone";

    const kodik = document.createElement("a");
    kodik.text = "Kodik";
    kodik.onclick = () => player.src =
      `//kodik.cc/find-player?shikimoriID=${player.animeId}` +
                            `&episode=${shikimori.getWatchingEpisode(player.animeId)}` +
                            `&poster=${config.poster}`;
    options.appendChild(kodik);

    return options;
  }

  static #createHeadline() {
    const headline = document.createElement("div");
    headline.className = "subheadline";
    headline.appendChild(document.createTextNode("смотреть"));

    return headline;
  }

  static #createPlayer() {
    const player = document.createElement("iframe");
    player.width = "100%";
    player.scrolling = "no";
    player.allowFullscreen = true;

    new ResizeObserver(() => {
      player.height = 9 * player.clientWidth / 16; // Calculate to fit 16:9
    }).observe(player);

    return player;
  }

  static #createBlock(options, headline, player) {
    const block = document.createElement("div");
    block.className = "block";

    block.appendChild(options);

    block.appendChild(headline);

    block.appendChild(player);

    return block;
  }
}
