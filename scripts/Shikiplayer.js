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

  /** @type {number} */
  static #episode;

  /** @type {number} */
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

      let playerContainer = this.#createPlayerContainer();

      let options = this.#createOptions();

      let headline = this.#createHeadline();

      let block = this.#createBlock(options, headline, playerContainer);

      let before = querySelector(`.b-db_entry`);

      insertAfter(block, before);

      this.#addPlayer(playerContainer);
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
   * @returns {HTMLDivElement}
   */
  static #createPlayerContainer()
  {
    let playerContainer = document.createElement(`div`);
    playerContainer.id = `kodik-player`;
    playerContainer.style.width = `100%`;

    new ResizeObserver(() => {
      // Calculate to fit 16:9
      playerContainer.style.height = `${(9 * playerContainer.clientWidth / 16)}px`;
    }).observe(playerContainer);

    return playerContainer;
  }

  /**
   * @param {HTMLDivElement} options
   * @param {HTMLDivElement} headline
   * @param {HTMLDivElement} playerContainer
   * @returns {HTMLDivElement}
   */
  static #createBlock(options, headline, playerContainer)
  {
    let block = document.createElement(`div`);
    block.className = `block`;

    block.appendChild(options);

    block.appendChild(headline);

    block.appendChild(playerContainer);

    return block;
  }

  /**
   * @param {HTMLDivElement} playerContainer
   */
  static #addPlayer(playerContainer)
  {
    let script = document.createElement(`script`);
    script.textContent = `
      var kodikAddPlayers = {
        width: "100%",
        height: "100%",
        shikimoriID: "${this.#animeId}",
        episode: "${this.#episode + 1}",
        only_season: true,
        poster: "${CONFIG.posterUrl}"
      };
    
      !function(e,n,t,r,a){r=e.createElement(n),a=e.getElementsByTagName(n)
      [0],r.async=!0,r.src=t,a.parentNode.insertBefore(r,a)}
      (document,"script","//kodik-add.com/add-players.min.js");
    `;
    
    window.addEventListener(`message`, (e) => {
      if (e.data.key === `kodik_player_current_episode`)
      {
        /** @type {number} */
        let episode = e.data.value.episode;

        Shikimori.setWatchedEpisodes(this.#animeId, this.#userId, episode);
      }
    });

    playerContainer.appendChild(script);
  }
}