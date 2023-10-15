/// <reference path="Shikimori/Shikimori.ts" />
/// <reference path="Shikimori/UserRate.ts" />

/// <reference path="Players/KodikPlayer.ts" />

/// <reference path="ShikiplayerData.ts" />

class Shikiplayer
{
  static #userId = Shikimori.getUserId();

  static #player: Player = new KodikPlayer();
  static #playerBlock = this.#createBlock(
    this.#createHeadline(),
    this.#player.element
  )

  static #episodeEnded = false;

  static
  {
    console.debug(`[Shikiplayer] (Starting) User ID:`, this.#userId);

    // TODO: Alert if user not logged in

    document.addEventListener(`turbolinks:load`, () => this.#onViewChanged());
    this.#onViewChanged(); // Bugfix too late script load (turbolinks:load fired before script was loaded)

    console.debug(`[Shikiplayer] (Starting) Done`);
  }

  static #onViewChanged()
  {
    let animePage = Shikimori.isAnimePage(window.location);

    if (animePage != null) this.#onAnimePageChanged(animePage);
    else console.debug(`[Shikiplayer] (View changed) Not an anime page`);
  }
  static #onAnimePageChanged(animePage: AnimePage)
  {
    // Bugfix too late script load (turbolinks:load fired before script was loaded)
    if (document.contains(this.#playerBlock)) return;

    let animeId = animePage.animeId;

    let userRate = Shikimori.getUserRate(animeId);
    let data = ShikiplayerData.load(userRate?.text ?? ``) ?? new ShikiplayerData();

    let currentEpisode = (userRate?.episodes ?? 0) + 1;
    let episodeTime = data.episodeTime;
    let translation = data.translation;

    this.#player.animeId = animeId;
    this.#player.translation = translation;
    this.#player.episode = currentEpisode;
    this.#player.episodeTime = episodeTime;
    this.#player.paused = () => {
      if (this.#userId == null) return;

      if (this.#episodeEnded) return;

      let data = new ShikiplayerData();
      data.episodeTime = this.#player.episodeTime;
      data.translation = this.#player.translation;

      let userRate = Shikimori.getUserRate(animeId) ?? new UserRate();
      userRate.status = (userRate.status === `rewatching`) ? `rewatching` : `watching`;
      userRate.episodes = this.#player.episode - 1;
      userRate.text = data.save(userRate.text ?? ``);

      Shikimori.setUserRate(animeId, this.#userId, userRate);

      console.debug(`[Shikiplayer] (Paused) Saved time: ${this.#player.episodeTime}s`);
    };
    this.#player.episodeTimeChanged = () => {
      if ((this.#player.episodeDuration - this.#player.episodeTime) < (3 * 60))
      {
        if (this.#userId == null) return;

        if (this.#episodeEnded) return;
        this.#episodeEnded = true;

        let data = new ShikiplayerData();
        data.episodeTime = 0;
        data.translation = this.#player.translation;

        let userRate = Shikimori.getUserRate(animeId) ?? new UserRate();
        userRate.status = (userRate.status === `rewatching`) ? `rewatching` : `watching`;
        userRate.episodes = this.#player.episode;
        userRate.text = data.save(userRate.text ?? ``);

        Shikimori.setUserRate(animeId, this.#userId, userRate);

        console.debug(`[Shikiplayer] (Episode Time Changed) Marked as watched`);
      }
      else this.#episodeEnded = false;
    };

    let elementBefore = document.querySelector(`.b-db_entry`)!;
    elementBefore.parentNode!.insertBefore(this.#playerBlock, elementBefore.nextSibling!);

    console.debug(`[Shikiplayer] (View changed) Anime ID: ${animeId}` +
                                             `, Current Episode: ${currentEpisode}` +
                                             `, User Rate:`, userRate);
  }

  static #createHeadline()
  {
    let headline = document.createElement(`div`);
    headline.className = `subheadline`;
    headline.appendChild(document.createTextNode(`смотреть`));
    headline.onclick = () => {
      let clicks = Number(headline.dataset[`clicks`] ?? `0`)

      clicks += 1;
      if (clicks >= 5)
      {
        clicks = 0;
        alert(`Shikiplayer version is ${CONFIG.version}`);
      }

      headline.dataset[`clicks`] = String(clicks);
    };

    return headline;
  }

  static #createBlock(headline: HTMLElement, player: HTMLElement)
  {
    let block = document.createElement(`div`);
    block.className = `block`;
    block.appendChild(headline);
    block.appendChild(player);

    return block;
  }
}