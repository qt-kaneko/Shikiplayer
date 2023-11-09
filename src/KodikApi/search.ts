namespace KodikApi
{
  export async function search(animeId: number)
  {
    let url = `https://kodikapi.com/search`
            + `?token=${CONFIG.kodikToken}`
            + `&shikimori_id=${animeId}`;

    let response = await fetch(url);
    let responseText = await response.text();
    let responseContent = <Response>JSON.parse(responseText);

    return responseContent.results;
  }
}