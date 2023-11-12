abstract class PlayerBase
{
  abstract get element(): HTMLElement;

  get animeId() {return this._animeId}
  protected _animeId = 0;

  get episode() {return this._episode}
  protected _episode = 0;

  get episodeDuration() {return this._episodeDuration}
  protected _episodeDuration = 0;

  get episodeTime() {return this._episodeTime}
  protected _episodeTime = 0;

  episodeTimeChanged?: () => Promise<void>;

  get translation() {return this._translation}
  protected _translation = 0;

  paused?: () => Promise<void>;

  get autoSwitchEpisode() {return this._autoSwitchEpisode}
  protected _autoSwitchEpisode = false;

  get speed() {return this._speed}
  protected _speed = 1;

  speedChanged?: () => Promise<void>;

  get exists() {return this._exists}
  protected _exists = false;

  existsChanged?: () => Promise<void>;

  async setAnimeId(value: number)
  {
    if (this._animeId === value) return;
    this._animeId = value;
    await this.onAnimeIdChanged();
  }
  protected abstract onAnimeIdChanged(): Promise<void>;

  async setEpisode(value: number)
  {
    if (this._episode === value) return;
    this._episode = value;
    await this.onEpisodeChanged();
  }
  protected abstract onEpisodeChanged(): Promise<void>;

  async setEpisodeTime(value: number)
  {
    if (this._episodeTime === value) return;
    this._episodeTime = value;
    await this.onEpisodeTimeChanged();
  }
  protected abstract onEpisodeTimeChanged(): Promise<void>;

  async setTranslation(value: number)
  {
    if (this._translation === value) return;
    this._translation = value;
    await this.onTranslationChanged();
  }
  protected abstract onTranslationChanged(): Promise<void>;

  async setAutoSwitchEpisode(value: boolean)
  {
    if (this._autoSwitchEpisode === value) return;
    this._autoSwitchEpisode = value;
    await this.onAutoSwitchEpisodeChanged();
  }
  protected abstract onAutoSwitchEpisodeChanged(): Promise<void>;

  async setSpeed(value: number)
  {
    if (this._speed === value) return;
    this._speed = value;
    await this.onSpeedChanged();
  }
  protected abstract onSpeedChanged(): Promise<void>;
}