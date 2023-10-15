/// <reference path="Player.ts" />

class KodikPlayer extends Player
{
  #animeUrl = ``;

  get element() {return this.#iframe}
  #iframe;

  constructor()
  {
    super();

    this.#iframe = document.createElement(`iframe`);
    this.#iframe.allowFullscreen = true;
    this.#iframe.width = `100%`;

    // Calculate to fit 16:9
    new ResizeObserver(() => this.#iframe.height = `${9 * this.#iframe.clientWidth / 16}px`)
              .observe(this.#iframe);

    window.addEventListener(`message`, (ev) => {
      if (ev.data.key === `kodik_player_duration_update`)
      {
        this._episodeDuration = ev.data.value;
      }
      else if (ev.data.key === `kodik_player_current_episode`)
      {
        this._episode = ev.data.value.episode;
        this._translation = ev.data.value.translation.id;
      }
      else if (ev.data.key === `kodik_player_pause`)
      {
        this.paused();
      }
      else if (ev.data.key === `kodik_player_time_update`)
      {
        this._episodeTime = ev.data.value;
        this.episodeTimeChanged();
      }
      else if (ev.data.event === `rewound`) // Cause kodik_player_time_update is not fired when seek backwards
      {
        this._episodeTime = Math.round(ev.data.time);
        this.episodeTimeChanged();
      }
    });
  }

  protected onAnimeIdChanged()
  {
    this.#animeUrl = KodikPlayer.#getPlayer(this._animeId, this.translation);
    this.#rebuildIframeSrc();
  }

  protected onEpisodeChanged()
  {
    this.#rebuildIframeSrc();
  }

  protected onEpisodeTimeChanged()
  {
    this.#rebuildIframeSrc();
  }

  protected onTranslationChanged()
  {
    this.#animeUrl = KodikPlayer.#getPlayer(this._animeId, this.translation);
    this.#rebuildIframeSrc();
  }

  #rebuildIframeSrc() {
    let src = `https:${this.#animeUrl}`
            + `?episode=${this._episode}`
            + `&start_from=${this._episodeTime}`
            + `&only_season=true`
            + `&poster=${CONFIG.posterUrl}`;

    this.#iframe.src = src;
  }

  static #getPlayer(animeId: number, translation: number)
  {
    let url = `https://kodikapi.com/get-player`
            + `?token=${CONFIG.kodikToken}`
            + `&shikimoriID=${animeId}`
            + `&prioritizeTranslations=${translation}`;

    let request = new XMLHttpRequest();
    request.open(`GET`, url, false);

    request.send();
    let response = JSON.parse(request.responseText);

    return <string>response[`link`];
  }
}