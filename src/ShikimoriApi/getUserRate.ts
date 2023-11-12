import {Anime} from "./Anime";

export async function getUserRate(animeId: number)
{
  let response = await fetch(`https://${location.hostname}/api/animes/${animeId}`, {
    headers: {
      [`Cache-Control`]: `no-cache, no-store, max-age=0`
    }
  });
  let responseText = await response.text();
  let responseContent = <Anime>JSON.parse(responseText);

  return responseContent.user_rate;
}