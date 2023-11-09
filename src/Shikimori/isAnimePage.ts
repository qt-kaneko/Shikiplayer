namespace Shikimori
{
  export function isAnimeView(location: Location)
  {
    let match = /\/animes\/[a-z]?(?<animeId>[0-9]+)/.exec(location.pathname);
    if (match == null) return null;

    let { animeId } = match.groups!;

    return new AnimeView(Number(animeId));
  }
}