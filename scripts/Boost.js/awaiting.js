/* Copyright 2023 Kaneko Qt
 * This file is part of Boost.js.
 *
 * Boost.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Boost.js is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Boost.js. If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

/** Waits for {@link condition}, checking it after call and every {@link target} change.
 * @param {() => boolean} condition
 * @returns {Promise<void>}
 */
const waitFor = async (condition,
                       target = document,
                       subtree = true, childList = true, attributes = true, characterData = true) =>
  new Promise((resolve) => {
    if (condition()) resolve();
    else
    {
      let observer = new MutationObserver(() => {
        if (condition())
        {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(target, {
        subtree: subtree,
        childList: childList,
        attributes: attributes,
        characterData: characterData
      });
    }
  });

/** Waits for {@linkcode event} from {@linkcode source} to be fired.
 * @template TEvent
 * @param {string} event
 * @param {{
 *   addEventListener(type: string, listener: (e: TEvent) => void): void,
 *   removeEventListener(type: string, listener: (e: TEvent) => void): void,
 * }} source
 * @returns {Promise<TEvent>}
 */
const waitForEvent = async (event, source) =>
  new Promise((resolve) => {
    /** @param {TEvent} e */
    let listener = (e) => {
      source.removeEventListener(event, listener);
      resolve(e);
    };
    source.addEventListener(event, listener);
  });