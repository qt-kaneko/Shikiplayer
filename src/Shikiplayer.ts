import * as Players from "./Players";
import * as Shikimori from "./Shikimori";
import * as ShikimoriApi from "./ShikimoriApi";
import {ShikiplayerData} from "./ShikiplayerData";

const html = String.raw;

export class Shikiplayer
{
  private _userId;
  private _animeId = -1;

  private _player: Players.PlayerBase = new Players.DummyPlayer();
  private _kodikPlayer = new Players.KodikPlayer();
  private _anilibriaPlayer = new Players.AnilibriaPlayer();
  private _players: Players.PlayerBase[] = [
    this._kodikPlayer,
    this._anilibriaPlayer
  ];

  private _playerBlock = this.createBlock(
    this.createOptions(),
    this.createHeadline(),
    this._player.element,
    this.createFooter(),
  );

  private _episodeEnded = false;

  constructor()
  {
    if (!/shikimori/.test(location.hostname)) return;

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

    for (let player of this._players)
    {
      await player.setAnimeId(this._animeId);
      await player.setTranslation(translation);
      await player.setEpisode(currentEpisode);
      await player.setEpisodeTime(episodeTime);
      await player.setAutoSwitchEpisode(true);

      player.paused = () => this.paused();
      player.episodeTimeChanged = () => this.episodeTimeChanged();
      player.speedChanged = () => this.speedChanged();
    }

    await this.changePlayer(this._kodikPlayer);

    document.querySelector(`.b-db_entry .b-user_rate`)!
            .addEventListener(`click`, () => this.statusChanged());

    console.debug(`[Shikiplayer] (View changed) Anime ID: ${this._animeId}` +
                                             `, Current Episode: ${currentEpisode}` +
                                             `, User Rate:`, userRate);
  }

  private async statusChanged()
  {
    if (this._userId == null) return;

    await new Promise(resolve => setTimeout(resolve, 500));

    let userRate = await ShikimoriApi.getUserRate(this._animeId) ?? {episodes: 0, status: ``};
    if (userRate.status !== `watching` && userRate.status !== `rewatching`)
    {
      console.debug(`[Shikiplayer] (Status Changed) Anime is not in (re)watching list, doing nothing ¯\\_(ツ)_/¯`);
      return;
    }

    let data = new ShikiplayerData();
    data.episodeTime = this._player.episodeTime;
    data.translation = this._player.translation;

    userRate.status = (userRate.status === `rewatching`) ? `rewatching` : `watching`;
    userRate.episodes = this._episodeEnded ? this._player.episode : (this._player.episode - 1);
    userRate.text = data.save(userRate.text ?? ``);

    ShikimoriApi.setUserRate(this._animeId, this._userId, userRate);

    console.debug(`[Shikiplayer] (Paused) Saved time: ${this._player.episodeTime}s`);
  }

  private async paused()
  {
    if (this._userId == null) return;

    if (this._episodeEnded) return;

    let userRate = await ShikimoriApi.getUserRate(this._animeId) ?? {episodes: 0, status: ``};
    if (userRate.status !== `watching` && userRate.status !== `rewatching`)
    {
      console.debug(`[Shikiplayer] (Paused) Anime is not in (re)watching list, doing nothing ¯\\_(ツ)_/¯`);
      return;
    }

    let data = new ShikiplayerData();
    data.episodeTime = this._player.episodeTime;
    data.translation = this._player.translation;

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

      let userRate = await ShikimoriApi.getUserRate(this._animeId) ?? {episodes: 0, status: ``};
      if (userRate.status !== `watching` && userRate.status !== `rewatching`)
      {
        console.debug(`[Shikiplayer] (Episode Time Changed) Anime is not in (re)watching list, doing nothing ¯\\_(ツ)_/¯`);
        return;
      }

      let data = new ShikiplayerData();
      data.episodeTime = 0;
      data.translation = this._player.translation;

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

  private async changePlayer(player: Players.PlayerBase)
  {
    this._player.element.replaceWith(player.element);
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

    let anilibria = document.createElement(`a`);
    anilibria.text = `Anilibria (beta)`;
    anilibria.onclick = (ev) => this.changePlayer(this._anilibriaPlayer);
    this._anilibriaPlayer.existsChanged = async () => {
      if (this._anilibriaPlayer.exists) options.appendChild(anilibria);
      else anilibria.remove();
    }

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
        alert(`Shikiplayer version is $(VERSION)`);

        document.querySelector<HTMLElement>(`#release-notes`)!.innerText = `- Обновлены трапы\n- Больше трапов\n- Трапы`;
      }

      headline.dataset[`clicks`] = clicks.toString();
    };

    return headline;
  }
  private createBlock(options: HTMLElement, headline: HTMLElement, player: HTMLElement, footer: HTMLElement)
  {
    let block = document.createElement(`div`);
    block.className = `block`;
    block.appendChild(options);
    block.appendChild(headline);
    block.appendChild(player);
    block.appendChild(footer);

    return block;
  }
  private createFooter()
  {
    let div = document.createElement(`div`);
    div.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      padding: 10px 0;
      border-top: 1px dashed rgb(73, 77, 80);
      border-bottom: 1px dashed rgb(73, 77, 80);
      margin-top: 15px;
    `;

    let releaseNotesSpan = document.createElement(`span`);
    releaseNotesSpan.id = `release-notes`;
    div.appendChild(releaseNotesSpan);

    let playerUpdateSpan = document.createElement(`span`);
    playerUpdateSpan.className = `b-link`;
    playerUpdateSpan.style.cssText = `
      font-weight: 600;
    `;
    playerUpdateSpan.innerText = `Обновление плеера`;
    releaseNotesSpan.appendChild(playerUpdateSpan);

    let versionSpan = document.createElement(`span`);
    versionSpan.id = `version`;
    versionSpan.innerText = `$(VERSION)`;
    versionSpan.style.cssText = `
      margin-left: 4px;
      color: rgb(161, 153, 140);
      font-size: 11px;
    `;
    releaseNotesSpan.appendChild(versionSpan);

    releaseNotesSpan.appendChild(document.createElement(`br`));

    for (let line of `$(RELEASE_NOTES)`.split(`\n`))
    {
      releaseNotesSpan.append(line);
      releaseNotesSpan.appendChild(document.createElement(`br`));
    }

    let donateA = document.createElement(`a`);
    donateA.className = `b-button`;
    donateA.href = `https://www.buymeacoffee.com/qt.kaneko`;
    donateA.style.cssText = `
      margin-left: auto;
      align-self: start;
      min-width: fit-content;
    `;
    donateA.innerText = `$ Поблагодарить разработчика`;
    div.appendChild(donateA);

    return div;
  }
}