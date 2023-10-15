abstract class Player
{
  get animeId() {return this._animeId}
  set animeId(value) {
    if (this._animeId === value) return;
    this._animeId = value;
    this.onAnimeIdChanged();
  }
  protected _animeId = 0;

  get episode() {return this._episode}
  set episode(value) {
    if (this._episode === value) return;
    this._episode = value;
    this.onEpisodeChanged();
  }
  protected _episode = 0;

  get episodeDuration() {return this._episodeDuration}
  protected _episodeDuration = 0;

  get episodeTime() {return this._episodeTime}
  set episodeTime(value) {
    if (this._episodeTime === value) return;
    this._episodeTime = value;
    this.onEpisodeTimeChanged();
  }
  protected _episodeTime = 0;

  episodeTimeChanged = (() => {});

  get translation() {return this._translation}
  set translation(value) {
    if (this._translation === value) return;
    this._translation = value;
    this.onTranslationChanged();
  }
  protected _translation = 0;

  paused = (() => {});

  abstract get element(): HTMLElement;

  protected abstract onAnimeIdChanged(): void;

  protected abstract onEpisodeChanged(): void;

  protected abstract onEpisodeTimeChanged(): void;

  protected abstract onTranslationChanged(): void;
}