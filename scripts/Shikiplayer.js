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
  static #watchedEpisodes;

  /** @type {number} */
  static #currentEpisode;

  /** @type {number} */
  static #episodeDuration;

  static #userId = Shikimori.getUserId();

  static #playerBlock = this.#createBlock(this.#createHeadline(), this.#createPlayer());

  static {this.#init()}
  static async #init()
  {
    log(`Starting...`);

    document.addEventListener(`turbolinks:load`, async () => await this.#onViewChanged());

    // Bugfix too late script load (turbolinks:load fired before script was loaded)
    await this.#onViewChanged();

    log(`Started: 'user id'='${this.#userId}'.`);
  }

  static async #onViewChanged()
  {
    let info = Shikimori.isAnimePage(window.location);
    if (info !== null)
    {
      if (document.contains(this.#playerBlock)) // Bugfix too late script load (turbolinks:load fired before script was loaded)
      {
        log(`View changed: Player is already added, skipping.`);
        return;
      }

      this.#animeId = Number(info[`id`]);
      this.#watchedEpisodes = Shikimori.getWatchedEpisodes(this.#animeId);

      log(`View changed: 'anime id'='${this.#animeId}', 'episode'='${this.#watchedEpisodes}'.`);

      this.#currentEpisode = 0;
      if (this.#watchedEpisodes !== null)
      {
        this.#currentEpisode = this.#watchedEpisodes;

        log(`Player: Loaded 'last watched episode'='${this.#currentEpisode}'.`);
      }
      else log(`Player: Tried to load last episode but it was 'null' (maybe not logged-in?).`);

      this.#currentEpisode += 1;

      let before = querySelector(`.b-db_entry`);

      insertAfter(this.#playerBlock, before);
    }
    else log(`View changed: Not on anime page.`)
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
      if (e.data.key === `kodik_player_duration_update`)
      {
        /** @type {number} */
        let episodeDuration = e.data.value;

        this.#episodeDuration = episodeDuration;

        log(`Player: Episode duration changed, 'episode duration'='${this.#episodeDuration}'.`);
      }
      else if (e.data.key === `kodik_player_time_update`)
      {
        /** @type {number} */
        let episodeTime = e.data.value;

        if ((this.#episodeDuration - episodeTime) < 3 * 60) // If < 3 minutes
          if (this.#userId !== null)
          {
            if (this.#watchedEpisodes !== this.#currentEpisode)
            {
              this.#watchedEpisodes = this.#currentEpisode;
              Shikimori.setWatchedEpisodes(this.#animeId, this.#userId, this.#watchedEpisodes);

              log(`Player: Saved 'last episode'='${this.#watchedEpisodes}'.`);
            }
          }
          else log(`Player: Tried to save last episode but 'user id' was 'null' (maybe not logged-in?).`);
      }
      if (e.data.key === `kodik_player_current_episode`)
      {
        /** @type {number} */
        let episode = e.data.value.episode;

        this.#currentEpisode = episode;

        log(`Player: Current episode changed, 'current episode'='${this.#currentEpisode}'`);
      }
    });

    return player;
  }

  /**
   * @param {HTMLDivElement} headline
   * @param {HTMLDivElement} player
   * @returns {HTMLDivElement}
   */
  static #createBlock(headline, player)
  {
    let block = document.createElement(`div`);
    block.className = `block`;

    block.appendChild(headline);

    block.appendChild(player);

    return block;
  }
}