import {Response} from "./Response";

export async function getPlayer(animeId: number)
{
  let url = `https://kodikapi.com/get-player`
          + `?token=$(KODIK_TOKEN)`
          + `&shikimori_id=${animeId}`;

  let response = await fetch(url);
  let responseText = await response.text();
  let responseContent = <Response>JSON.parse(responseText);

  return responseContent;
}