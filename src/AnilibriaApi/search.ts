namespace AnilibriaApi
{
  export async function search(alternativePlayer: string)
  {
    let url = `https://api.anilibria.tv/v3/title/search/advanced`
            + `?filter=id`
            + `&simple_query=player.alternative_player==${alternativePlayer}`;

    let response: globalThis.Response;
    try {response = await fetch(url)}
    catch (ex)
    {
      if (ex instanceof DOMException) {return} // TODO: Error handling
      else throw ex;
    }
    let responseText = await response.text();
    let responseContent = <Response>JSON.parse(responseText);

    return (responseContent.list.length > 0) ? responseContent.list[0] : null;
  }
}