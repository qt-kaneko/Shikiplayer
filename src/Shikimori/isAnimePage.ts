import {AnimeView} from "./AnimeView";

export function isAnimeView(location: Location)
{
  let match = /\/animes\/[a-z]?(?<animeId>[0-9]+)/.exec(location.pathname);
  if (match == null) return null;

  let { animeId } = match.groups!;

  let animeView: AnimeView = {
    animeId: Number(animeId)
  };
  return animeView;
}