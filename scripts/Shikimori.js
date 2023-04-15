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

class Shikimori
{
  /**
   * @param {Location} location
   * @returns {{
   *   [key: string]: string
   * } | null}
   */
  static isAnimePage(location)
  {
    return new RegExp(`/animes/[a-z]?(?<id>[0-9]+)`)
                .exec(location.pathname)?.groups ?? null;
  }

  /**
   * @param {number} animeId
   */
  static getWatchedEpisodes(animeId)
  {
    let request = new XMLHttpRequest();
    request.open(
      `GET`,
      `${window.location.protocol}//${window.location.hostname}/api/animes/${animeId}`,
      false
    );
    request.setRequestHeader(`Cache-Control`, `no-cache, no-store, max-age=0`);

    request.send();
    let response = JSON.parse(request.responseText);

    return response.user_rate?.episodes ?? 0;
  }

  /**
   * @param {number} animeId
   * @param {number} userId
   * @param {number} episodes
   */
  static setWatchedEpisodes(animeId, userId, episodes)
  {
    let request = new XMLHttpRequest();
    request.open(
      `POST`,
      `${window.location.protocol}//${window.location.hostname}/api/v2/user_rates`,
      false
    );

    let content = new URLSearchParams({
      [`user_rate[user_id]`]: userId.toString(),
      [`user_rate[target_id]`]: animeId.toString(),
      [`user_rate[target_type]`]:	`Anime`,
      [`user_rate[status]`]: `watching`,
      [`user_rate[episodes]`]: episodes.toString()
    });

    request.send(content);
  }

  /**
   * @returns {number | null}
   */
  static getUserId()
  {
    let request = new XMLHttpRequest();
    request.open(
      `GET`,
      `${window.location.protocol}//${window.location.hostname}/api/users/whoami`,
      false
    );

    request.send();
    let response = JSON.parse(request.responseText);

    return response?.id;
  }
}