/// <reference path="AnimePage.ts" />
/// <reference path="UserRate.ts" />

class Shikimori
{
  static isAnimePage(location: Location)
  {
    let match = /\/animes\/[a-z]?(?<animeId>[0-9]+)/.exec(location.pathname);
    if (match == null) return null;

    let { animeId } = match.groups!;

    return new AnimePage(Number(animeId));
  }

  static getUserRate(animeId: number)
  {
    let request = new XMLHttpRequest();
    request.open(`GET`, `https://${location.hostname}/api/animes/${animeId}`, false);
    request.setRequestHeader(`Cache-Control`, `no-cache, no-store, max-age=0`);

    request.send();
    let response = <Anime>JSON.parse(request.responseText);

    return response.user_rate;
  }

  static setUserRate(animeId: number, userId: number, userRate: UserRate)
  {
    let request = new XMLHttpRequest();
    request.open(`POST`, `https://${location.hostname}/api/v2/user_rates`, false);

    let content = new URLSearchParams({
      [`user_rate[user_id]`]: userId.toString(),
      [`user_rate[target_id]`]: animeId.toString(),
      [`user_rate[target_type]`]:	`Anime`,
      [`user_rate[status]`]: userRate.status,
      [`user_rate[episodes]`]: userRate.episodes.toString(),
    });
    if (userRate.text != null) content.set(`user_rate[text]`, userRate.text);

    request.send(content);
  }

  static getUserId()
  {
    let request = new XMLHttpRequest();
    request.open(`GET`, `https://${location.hostname}/api/users/whoami`, false);

    request.send();
    let response = <User|null>JSON.parse(request.responseText);

    return response?.id ?? null;
  }
}