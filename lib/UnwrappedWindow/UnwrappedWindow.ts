/// <reference path="Messages/MessageGet.ts" />
/// <reference path="Messages/MessageSet.ts" />

declare const wrappedJSObject: (typeof window) | undefined;
declare const unsafeWindow: (typeof window) | undefined;
declare const chrome: any | undefined;

var unwrappedWindow: {[k: string]: any, eval?(x: string): void, init?(injectPath: string): Promise<void>} = {
  async init(injectPath: string) {
    if (typeof wrappedJSObject !== `undefined`) // Firefox
    {
      unwrappedWindow = new Proxy({}, {
        get(target, p: string) {
          let propertyPath = p.split(`.`);

          let value = <any>wrappedJSObject;
          for (let property of propertyPath) value = value[property];

          return value;
        },
        set(target, p: string, newValue) {
          let propertyPath = p.split(`.`);
          let property = propertyPath.pop()!;

          let container = <any>wrappedJSObject;
          for (let property of propertyPath) container = container[property];

          container[property] = newValue;
          return true;
        }
      });
    }
    else if (typeof unsafeWindow !== `undefined`) // Userscript
    {
      unwrappedWindow = new Proxy({}, {
        get(target, p: string) {
          let propertyPath = p.split(`.`);

          let value = <any>unsafeWindow;
          for (let property of propertyPath) value = value[property];

          return value;
        },
        set(target, p: string, newValue) {
          let propertyPath = p.split(`.`);
          let property = propertyPath.pop()!;

          let container = <any>unsafeWindow;
          for (let property of propertyPath) container = container[property];

          container[property] = newValue;
          return true;
        }
      });
    }
    else // 🤬 Chrome
    {
      let port: MessagePort;
      let awaitPort = new Promise<void>(r =>
        window.addEventListener(`message`, (ev) => {
          if (ev.data !== `unwrappedWindow`) return;

          port = ev.ports[0];
          r();
        })
      );

      let script = document.createElement(`script`);
      script.src = chrome.runtime.getURL(injectPath);
      (document.head ?? document.body).appendChild(script);

      await awaitPort;

      unwrappedWindow = new Proxy({}, {
        get(target, p: string) {
          let propertyPath = p.split(`.`);

          let message: MessageGet = {
            action: `get`,
            propertyPath: propertyPath
          };

          let received = new Promise(p => port.onmessage = (ev) => p(ev.data));
          port.postMessage(message);
          return received;
        },
        set(target, p: string, newValue) {
          let propertyPath = p.split(`.`);
          let property = propertyPath.pop()!;

          let message = {
            action: `set`,
            propertyPath: propertyPath,
            property: property,
            value: newValue
          };

          port.postMessage(message);
          return true;
        }
      });
    }
  }
};