class ShikiplayerData
{
  static get #dataPrefix() {return `Shikiplayer Data: `};

  episodeTime = 0;
  translation = 0;

  save(to: string)
  {
    let dataStart = to.indexOf(ShikiplayerData.#dataPrefix);

    let other = (dataStart !== -1) ? to.slice(0, dataStart) : to;
    other = other.trimEnd();

    let data = this;
    let dataJson = JSON.stringify(data);

    let result = `${other}\n\n${ShikiplayerData.#dataPrefix}${dataJson}`;
    return result;
  }
  static load(from: string)
  {
    let dataStart = from.indexOf(ShikiplayerData.#dataPrefix);

    if (dataStart === -1) return null;

    let dataJson = from.slice(dataStart + this.#dataPrefix.length);
    let data = <ShikiplayerData>JSON.parse(dataJson);

    return data;
  }
}