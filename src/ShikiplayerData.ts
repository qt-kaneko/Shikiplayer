export class ShikiplayerData
{
  private static readonly _dataPrefix = `Shikiplayer Data: `;

  episodeTime = 0;
  translation = 0;

  save(to: string)
  {
    let dataStart = to.indexOf(ShikiplayerData._dataPrefix);

    let other = (dataStart !== -1) ? to.slice(0, dataStart) : to;
    other = other.trimEnd();

    let data = this;
    let dataJson = JSON.stringify(data);

    let result = `${other}\n\n${ShikiplayerData._dataPrefix}${dataJson}`;
    return result;
  }
  static load(from: string)
  {
    let dataStart = from.indexOf(ShikiplayerData._dataPrefix);

    if (dataStart === -1) return null;

    let dataJson = from.slice(dataStart + this._dataPrefix.length);
    let data = <ShikiplayerData>JSON.parse(dataJson);

    return data;
  }
}