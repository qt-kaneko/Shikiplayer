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

class Kodik
{
  /**
   * @param {number} animeId
   * @param {number} episode
   * @returns {string} Link to player
   */
  static getPlayer(animeId, episode)
  {
    let request = new XMLHttpRequest();
    request.open(
      `GET`,
      `${window.location.protocol}://kodikapi.com/get-player?token=${CONFIG.kodikToken}&shikimoriID=${animeId}&episode=${episode}`,
      false
    );

    request.send();
    let response = JSON.parse(request.responseText);

    return response.link;
  }
}