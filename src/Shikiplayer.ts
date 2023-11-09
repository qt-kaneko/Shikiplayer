class Shikiplayer
{
  private _userId;
  private _animeId = -1;

  private _player: Player = new DummyPlayer();
  private _kodikPlayer = new KodikPlayer();
  private _anilibriaPlayer = new AnilibriaPlayer();

  private _playerBlock = this.createBlock(
    this.createOptions(),
    this.createHeadline(),
    this._player.element
  );

  private _episodeEnded = false;

  constructor()
  {
    if (!CONFIG.shikimoriUrl.test(location.hostname)) return;

    this._userId = Shikimori.getUserId();
    console.debug(`[Shikiplayer] (Starting) User ID:`, this._userId);

    // TODO: Alert if user not logged in

    document.addEventListener(`turbolinks:load`, () => this.onViewChanged());
    this.onViewChanged(); // Bugfix too late script load (turbolinks:load fired before script was loaded)

    console.debug(`[Shikiplayer] (Starting) Done`);
  }

  private async onViewChanged()
  {
    let animePage = Shikimori.isAnimeView(window.location);

    if (animePage != null) await this.onAnimeViewChanged(animePage);
    else console.debug(`[Shikiplayer] (View changed) Not an anime page`);
  }
  private async onAnimeViewChanged(animePage: Shikimori.AnimeView)
  {
    // Bugfix too late script load (turbolinks:load fired before script was loaded)
    if (document.contains(this._playerBlock)) return;

    let elementBefore = document.querySelector(`.b-db_entry`)!;
    elementBefore.parentNode!.insertBefore(this._playerBlock, elementBefore.nextSibling!);

    this._animeId = animePage.animeId;

    let userRate = await ShikimoriApi.getUserRate(this._animeId);
    let data = ShikiplayerData.load(userRate?.text ?? ``) ?? new ShikiplayerData();

    let currentEpisode = (userRate?.episodes ?? 0) + 1;
    let translation = data.translation;
    let episodeTime = data.episodeTime;

    await this._player.setAnimeId(this._animeId);
    await this._player.setTranslation(translation);
    await this._player.setEpisode(currentEpisode);
    await this._player.setEpisodeTime(episodeTime);
    await this._player.setAutoSwitchEpisode(true);
    await this._player.setSpeed(localStorage[`speed`] ?? 1);

    this._player.paused = () => this.paused();
    this._player.episodeTimeChanged = () => this.episodeTimeChanged();
    this._player.speedChanged = () => this.speedChanged();

    await this.changePlayer(this._kodikPlayer);

    console.debug(`[Shikiplayer] (View changed) Anime ID: ${this._animeId}` +
                                             `, Current Episode: ${currentEpisode}` +
                                             `, User Rate:`, userRate);
  }

  private async paused()
  {
    if (this._userId == null) return;

    if (this._episodeEnded) return;

    let data = new ShikiplayerData();
    data.episodeTime = this._player.episodeTime;
    data.translation = this._player.translation;

    let userRate = await ShikimoriApi.getUserRate(this._animeId) ?? {episodes: 0, status: ``};
    userRate.status = (userRate.status === `rewatching`) ? `rewatching` : `watching`;
    userRate.episodes = this._player.episode - 1;
    userRate.text = data.save(userRate.text ?? ``);

    ShikimoriApi.setUserRate(this._animeId, this._userId, userRate);

    console.debug(`[Shikiplayer] (Paused) Saved time: ${this._player.episodeTime}s`);
  }
  private async episodeTimeChanged()
  {
    if ((this._player.episodeDuration - this._player.episodeTime) < (3 * 60))
    {
      if (this._userId == null) return;

      if (this._episodeEnded) return;
      this._episodeEnded = true;

      let data = new ShikiplayerData();
      data.episodeTime = 0;
      data.translation = this._player.translation;

      let userRate = await ShikimoriApi.getUserRate(this._animeId) ?? {episodes: 0, status: ``};
      userRate.status = (userRate.status === `rewatching`) ? `rewatching` : `watching`;
      userRate.episodes = this._player.episode;
      userRate.text = data.save(userRate.text ?? ``);

      ShikimoriApi.setUserRate(this._animeId, this._userId, userRate);

      console.debug(`[Shikiplayer] (Episode Time Changed) Marked as watched`);
    }
    else this._episodeEnded = false;
  }
  private async speedChanged()
  {
    localStorage[`speed`] = this._player.speed;
  }

  private async changePlayer(player: Player)
  {
    this._player.element.replaceWith(player.element);

    await player.setAnimeId(this._player.animeId);
    await player.setTranslation(this._player.translation);
    await player.setEpisode(this._player.episode);
    await player.setEpisodeTime(this._player.episodeTime);
    await player.setAutoSwitchEpisode(this._player.autoSwitchEpisode);
    await player.setSpeed(this._player.speed);

    player.paused = this._player.paused;
    player.episodeTimeChanged = this._player.episodeTimeChanged;
    player.speedChanged = this._player.speedChanged;

    this._player = player;
  }

  private createOptions()
  {
    let options = document.createElement(`div`);
    options.className = `b-options-floated mobile-phone`;

    let kodik = document.createElement(`a`);
    kodik.text = `Kodik`;
    kodik.onclick = (ev) => this.changePlayer(this._kodikPlayer);
    options.appendChild(kodik);

    // let anilibria = document.createElement(`a`);
    // anilibria.text = `Anilibria`;
    // anilibria.onclick = (ev) => this.changePlayer(this._anilibriaPlayer);
    // options.appendChild(anilibria);

    return options;
  }
  private createHeadline()
  {
    let headline = document.createElement(`div`);
    headline.className = `subheadline`;
    headline.appendChild(document.createTextNode(`смотреть`));
    headline.onclick = (ev) => {
      let clicks = Number(headline.dataset[`clicks`] ?? `0`)

      clicks += 1;
      if (clicks >= 5)
      {
        clicks = 0;
        alert(`Shikiplayer version is ${CONFIG.version}`);
      }

      headline.dataset[`clicks`] = clicks.toString();
    };

    return headline;
  }
  private createBlock(options: HTMLElement, headline: HTMLElement, player: HTMLElement)
  {
    let block = document.createElement(`div`);
    block.className = `block`;
    block.appendChild(options);
    block.appendChild(headline);
    block.appendChild(player);

    return block;
  }
}