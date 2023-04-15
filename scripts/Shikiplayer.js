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
  static {this.#init()}
  static async #init()
  {
    log(`Starting...`);

    document.addEventListener(`turbolinks:load`, async () => await this.#onViewChanged());
  }

  static async #onViewChanged()
  {
    let info = Shikimori.isAnimePage();
    if (info !== null) {
      let animeId = Number(info[`id`]);

      let episode = Shikimori.getWatchingEpisode(animeId);

      let player = this.#createPlayer();
      player.src = `//kodik.cc/find-player?shikimoriID=${animeId}` +
                                         `&episode=${episode}` +
                                         `&poster=${CONFIG.poster}`;

      let options = this.#createOptions();

      let headline = this.#createHeadline();

      let block = this.#createBlock(options, headline, player);

      let before = querySelector(`.b-db_entry`);

      insertAfter(block, before);
    }
  }

  /**
   * @returns {HTMLDivElement}
   */
  static #createOptions()
  {
    let options = document.createElement(`div`);
    options.className = `b-options-floated mobile-phone`;

    return options;
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
    player.scrolling = `no`;
    player.allowFullscreen = true;

    new ResizeObserver(() => {
      // Calculate to fit 16:9
      player.height = (9 * player.clientWidth / 16).toString();
    }).observe(player);

    return player;
  }

  /**
   * @param {HTMLDivElement} options
   * @param {HTMLDivElement} headline
   * @param {HTMLIFrameElement} player
   * @returns {HTMLDivElement}
   */
  static #createBlock(options, headline, player)
  {
    let block = document.createElement(`div`);
    block.className = `block`;

    block.appendChild(options);

    block.appendChild(headline);

    block.appendChild(player);

    return block;
  }
}