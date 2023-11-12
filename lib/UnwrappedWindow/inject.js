(function() { "use strict";

let channel = new MessageChannel();
let port = channel.port1;

port.onmessage = (ev) => {
  /** @type {import("Messages/MessageGet.ts").MessageGet |
   *         import("Messages/MessageSet.ts").MessageSet} */
  let message = ev.data;

  if (message.action === `get`)
  {
    let propertyPath = message.propertyPath;

    /** @type {any} */
    let value = window;
    for (let property of propertyPath) value = value[property];

    port.postMessage(value);
  }
  else if (message.action === `set`)
  {
    let propertyPath = message.propertyPath;
    let property = message.property;

    /** @type {any} */
    let container = window;
    for (let property of propertyPath) container = container[property];

    container[property] = message.value;
  }
};

window.postMessage(`unwrappedWindow`, `*`, [channel.port2]);

})();