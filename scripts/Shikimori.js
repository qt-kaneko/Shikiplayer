"use strict";

class Shikimori
{
  /**
   * @returns {{
   *   [key: string]: string
   * } | null}
   */
  static isAnimePage()
  {
    return new RegExp(`/animes/[a-z]?(?<id>[0-9]+)`)
                .exec(window.location.pathname)?.groups ?? null;
  }

  /**
   * @param {number} animeId
   */
  static getWatchingEpisode(animeId)
  {
    let request = new XMLHttpRequest();
    request.open(
      `GET`,
      `${window.location.protocol}//${window.location.hostname}/api/animes/${animeId}`,
      false);

    request.send();
    let response = JSON.parse(request.response);

    return (response.user_rate?.episodes ?? 0) + 1;
  }
}