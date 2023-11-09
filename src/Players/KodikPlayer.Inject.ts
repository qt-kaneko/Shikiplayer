/// <reference path="../../lib/UnwrappedWindow/UnwrappedWindow.ts" />

namespace $KodikPlayer
{
  class Inject
  {
    private static _player?: HTMLVideoElement;
    private static _awaitPlayer: Promise<void>;

    private static _port: MessagePort;

    static {this.block()}
    private static async block()
    {
      // If script is loaded inside Kodiks iframe
      if (!CONFIG.kodikUrl.test(location.hostname)) return;

      await unwrappedWindow.init!(`$(UNWRAPPED_WINDOW)`);

      let channel = new MessageChannel();
      this._port = channel.port1;

      this._port.onmessage = (ev) => this.onMessage(ev.data);
      window.parent.postMessage(`shikiplayer`, `*`, [channel.port2]);

      this._player = document.querySelector<HTMLVideoElement>(`video`) ?? undefined;
      if (this._player == null)
      {
        this._awaitPlayer = new Promise(r =>
          new MutationObserver((mutations, observer) => {
            if (mutations.flatMap(mutation => mutation.addedNodes).length === 0) return;

            let player = document.querySelector(`video`);
            if (player == null) return;

            this._player = player;
            observer.disconnect();
            r();
          }).observe(document.documentElement, {childList: true, subtree: true})
        );
      }

      await this._awaitPlayer;
    }

    private static async onMessage(message: Message)
    {
      if (message.action === `setAutoSwitchEpisode`)
      {
        unwrappedWindow[`auto_switch_episode`] = message.data;
      }
    }

    private constructor() {}
  }
}