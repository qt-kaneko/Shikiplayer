/* Copyright 2023 Kaneko Qt
 * This file is part of Shikiplayer.
 *
 * Shikiplayer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Shikiplayer is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Shikiplayer. If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

class Shikiplayer
{
  /** @type {number} */
  static #animeId;

  /** @type {number | null} */
  static #episode;

  /** @type {number | null} */
  static #userId;

  static {this.#init()}
  static async #init()
  {
    log(`Starting...`);

    this.#userId = Shikimori.getUserId();

    document.addEventListener(`turbolinks:load`, async () => await this.#onViewChanged());
  }

  static async #onViewChanged()
  {
    let info = Shikimori.isAnimePage(window.location);
    if (info !== null) {
      this.#animeId = Number(info[`id`]);
      this.#episode = Shikimori.getWatchedEpisodes(this.#animeId);

      log(`View changed:`, `Anime ID:`, this.#animeId, `Episode:`, this.#episode)

      let player = this.#createPlayer();
      player.src = `${Kodik.getPlayer(this.#animeId)}?episode=${(this.#episode ?? 0) + 1}`+
                                                    `&only_season=true` +
                                                    `&poster=${CONFIG.posterUrl}`;

      let headline = this.#createHeadline();

      let block = this.#createBlock(headline, player);

      let before = querySelector(`.b-db_entry`);

      insertAfter(block, before);
    }
  }

  /**
   * @returns {HTMLDivElement}
   */
  static #createHeadline()
  {
    let headline = document.createElement(`div`);
    headline.className = `subheadline`;
    headline.appendChild(document.createTextNode(`смотреть`));

    return headline;
  }

  /**
   * @returns {HTMLIFrameElement}
   */
  static #createPlayer()
  {
    let player = document.createElement(`iframe`);
    player.width = `100%`;
    player.allowFullscreen = true;

    new ResizeObserver(() => {
      // Calculate to fit 16:9
      player.height = `${(9 * player.clientWidth / 16)}px`;
    }).observe(player);

    window.addEventListener(`message`, (e) => {
      if (e.data.key === `kodik_player_current_episode`)
      {
        if (this.#userId === null) return;

        /** @type {number} */
        let episode = e.data.value.episode;

        Shikimori.setWatchedEpisodes(this.#animeId, this.#userId, episode);
      }
    });

    return player;
  }

  /**
   * @param {HTMLDivElement} headline
   * @param {HTMLDivElement} playerContainer
   * @returns {HTMLDivElement}
   */
  static #createBlock(headline, playerContainer)
  {
    let block = document.createElement(`div`);
    block.className = `block`;

    block.appendChild(headline);

    block.appendChild(playerContainer);

    return block;
  }
}