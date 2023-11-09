/// <reference path="Player.ts" />

class DummyPlayer extends Player
{
  get element() {return this._element};
  private _element = document.createElement(`div`);

  protected async onAnimeIdChanged() {}
  protected async onEpisodeChanged() {}
  protected async onEpisodeTimeChanged() {}
  protected async onTranslationChanged() {}
  protected async onAutoSwitchEpisodeChanged() {}
  protected async onSpeedChanged() {}
}

