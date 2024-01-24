import * as KodikApi from "../KodikApi";

import {unwrappedWindow} from "../../lib/UnwrappedWindow/UnwrappedWindow";

import {PlayerBase} from "./PlayerBase";

interface Message
{
  action: string;
  data: any;
}

export class KodikPlayer extends PlayerBase
{
  private _url = ``;

  get element() {return this._iframe}
  private _iframe;

  private get _port() {return this.__port}
  private set _port(value) {
    if (this.__port === value) return;
    this.__port = value;
    this.onPortChanged();
  };
  private __port?: MessagePort;

  private _awaitPort: Promise<void>;

  public static async inject()
  {
    // If script is loaded inside Kodiks iframe
    if (!/kodik/.test(location.hostname)) return;

    await unwrappedWindow.init!(`$(UNWRAPPED_WINDOW)`);

    let channel = new MessageChannel();
    let port = channel.port1;

    port.onmessage = (ev) => onMessage(ev.data);
    window.parent.postMessage(`shikiplayer`, `*`, [channel.port2]);

    let awaitPlayer: Promise<void> | undefined;

    let player = document.querySelector<HTMLVideoElement>(`video`) ?? undefined;
    if (player == null)
    {
      awaitPlayer = new Promise(resolve =>
        new MutationObserver((mutations, observer) => {
          if (mutations.flatMap(mutation => mutation.addedNodes).length === 0) return;

          player = document.querySelector(`video`) ?? undefined;
          if (player == null) return;

          observer.disconnect();
          resolve();
        }).observe(document.documentElement, {childList: true, subtree: true})
      );
    }

    await awaitPlayer;

    function onMessage(message: Message)
    {
      if (message.action === `setAutoSwitchEpisode`)
      {
        unwrappedWindow[`auto_switch_episode`] = message.data;
      }
    }
  }

  constructor()
  {
    super();

    this._iframe = document.createElement(`iframe`);
    this._iframe.allowFullscreen = true;
    this._iframe.width = `100%`;

    // Calculate to fit 16:9
    new ResizeObserver(() => this._iframe.height = `${9 * this._iframe.clientWidth / 16}px`)
      .observe(this._iframe);

    window.addEventListener(`message`, async (ev) => {
      if (ev.data.key === `kodik_player_duration_update`)
      {
        this._episodeDuration = ev.data.value;
      }
      else if (ev.data.key === `kodik_player_current_episode`)
      {
        console.debug(`[Shikiplayer] (Kodik Player) kodik_player_current_episode`);

        this._episode = ev.data.value.episode;
        this._translation = ev.data.value.translation.id;

        await this.onAutoSwitchEpisodeChanged();
        await this.onSpeedChanged();
      }
      else if (ev.data.key === `kodik_player_pause`)
      {
        await this.paused?.();
      }
      else if (ev.data.key === `kodik_player_time_update`)
      {
        this._episodeTime = ev.data.value;
        await this.episodeTimeChanged?.();
      }
      else if (ev.data.event === `rewound`) // Cause kodik_player_time_update is not fired when seek backwards
      {
        this._episodeTime = Math.round(ev.data.time);
        await this.episodeTimeChanged?.();
      }
    });

    this._awaitPort = new Promise(resolve =>
      window.addEventListener(`message`, (ev) => {
        if (ev.data !== `shikiplayer`) return;

        this._port = ev.ports[0];

        resolve();
      })
    );
  }

  private onPortChanged()
  {
    this._port!.onmessage = (ev) => this.onMessage(ev);
  }
  private onMessage(ev: MessageEvent)
  {
    let message = <Message>ev.data;

    if (message.action === `setSpeed`)
    {
      this._speed = message.data;
      this.speedChanged?.();
    }
  }

  private rebuildIframeSrc()
  {
    this._iframe.src = `https:${this._url}`
                     + `?episode=${this._episode}`
                     + `&start_from=${this._episodeTime}`
                     + `&poster=$(POSTER)`;
  }

  protected async onAnimeIdChanged()
  {
    let urls = await KodikApi.search(this._animeId);
    this._url = urls.find(r => r.translation.id === this.translation)?.link ?? urls[0].link;

    this.rebuildIframeSrc();
  }
  protected async onEpisodeChanged()
  {
    this.rebuildIframeSrc();
  }
  protected async onEpisodeTimeChanged()
  {
    this.rebuildIframeSrc();
  }
  protected async onTranslationChanged()
  {
    let urls = await KodikApi.search(this._animeId);
    this._url = urls.find(r => r.translation.id === this.translation)?.link ?? urls[0].link;

    this.rebuildIframeSrc();
  }
  protected async onAutoSwitchEpisodeChanged()
  {
    let send = () => {
      let message: Message = {
        action: `setAutoSwitchEpisode`,
        data: this._autoSwitchEpisode
      };
  
      this._port!.postMessage(message);
    };

    if (this._port != null) send();
    else this._awaitPort.then(() => send());
  }
  protected async onSpeedChanged() {}
}