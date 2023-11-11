/// <reference path="Player.ts" />

class AnilibriaPlayer extends Player
{
  private _url = ``;

  get element() {return this._iframe}
  private _iframe;

  constructor()
  {
    super();

    this._iframe = document.createElement(`iframe`);
    this._iframe.allowFullscreen = true;
    this._iframe.width = `100%`;

    // Calculate to fit 16:9
    new ResizeObserver(() => this._iframe.height = `${9 * this._iframe.clientWidth / 16}px`)
      .observe(this._iframe);
  }

  private rebuildIframeSrc()
  {
    let src = `https:${this._url}`;

    this._iframe.src = src;
  }

  protected async onAnimeIdChanged()
  {
    let id = await MALibriaApi.mal2anilibria(this._animeId);

    this._exists = (id != null);
    await this.existsChanged?.();

    if (id != null) this._url = `//www.anilibria.tv/public/iframe.php?id=${id}`;

    this.rebuildIframeSrc();
  }
  protected async onEpisodeChanged() {}
  protected async onEpisodeTimeChanged() {}
  protected async onTranslationChanged() {}
  protected async onAutoSwitchEpisodeChanged() {}
  protected async onSpeedChanged() {}
}