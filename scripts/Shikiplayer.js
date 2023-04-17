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
  /**@type {number}*/ static #animeId;

  /**@type {number | null}*/ static #watchedEpisodes;
  /**@type {number}*/ static #currentEpisode;

  /**@type {number}*/ static #episodeDuration;

  static #userId = Shikimori.getUserId();

  static #player = this.#createPlayer();
  static #playerBlock = this.#createBlock(this.#createHeadline(), this.#player);

  static {this.#init()}
  static async #init()
  {
    log(`(Starting)`);

    document.addEventListener(`turbolinks:load`, async () => await this.#onViewChanged());
    await this.#onViewChanged(); // Bugfix too late script load (turbolinks:load fired before script was loaded)

    log(`(Started) User ID: `, this.#userId);
  }

  static async #onViewChanged()
  {
    let info = Shikimori.isAnimePage(window.location);
    if (info !== null)
    {
      if (document.contains(this.#playerBlock)) // Bugfix too late script load (turbolinks:load fired before script was loaded)
      {
        log(`(View changed) Player is already added, skipping`);
        return;
      }

      this.#animeId = Number(info[`id`]);

      this.#watchedEpisodes = Shikimori.getWatchedEpisodes(this.#animeId);
      if (this.#watchedEpisodes === null) log(`(Player) Tried to load Watched Episodes but it was NULL (maybe not logged-in or no episodes watched?)`);

      this.#currentEpisode = (this.#watchedEpisodes ?? 0) + 1;

      log(`(View changed)`, `Anime ID:`, this.#animeId,
                            `Watched Episodes`, this.#watchedEpisodes,
                            `Current Episode:`, this.#currentEpisode);

      this.#player.src = `${Kodik.getPlayer(this.#animeId)}?episode=${this.#currentEpisode}`+
                                                          `&only_season=true` +
                                                          `&poster=${CONFIG.posterUrl}`;

      insertAfter(this.#playerBlock, querySelector(`.b-db_entry`));
    }
    else log(`(View changed) Not an anime page`)
  }

  static #createHeadline()
  {
    let headline = document.createElement(`div`);
    headline.className = `subheadline`;
    headline.appendChild(document.createTextNode(`смотреть`));

    return headline;
  }

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
        this.#episodeDuration = e.data.value;

        log(`(Player) Episode Duration changed:`, this.#episodeDuration);
      }
      else if (e.data.key === `kodik_player_time_update`)
      {
        /** @type {number} */
        let episodeTime = e.data.value;

        if ((this.#episodeDuration - episodeTime) < 3 * 60) // If < 3 minutes left
          if (this.#watchedEpisodes !== this.#currentEpisode) // If not already saved
            if (this.#userId !== null)
            {
              this.#watchedEpisodes = this.#currentEpisode;
              Shikimori.setWatchedEpisodes(this.#animeId, this.#userId, this.#watchedEpisodes);

              log(`(Player) Saved Watched Episodes:`, this.#watchedEpisodes);    
            }
            else log(`(Player) Tried to save Watched Episodes but User ID was NULL (maybe not logged-in?)`);
      }
      else if (e.data.key === `kodik_player_current_episode`)
      {
        this.#currentEpisode = e.data.value.episode;

        log(`(Player) Current Episode changed:`, this.#currentEpisode);
      }
    });

    return player;
  }

  /**
  * @param {HTMLDivElement} headline
  * @param {HTMLDivElement} player
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