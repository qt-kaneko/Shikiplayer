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

/** @type {any} */
const storage = new Proxy({}, {
  get(target, p, receiver)
  {
    let key = `#${CONFIG.name.toLocaleLowerCase()}_${p.toString()}`;
    let value = window.localStorage.getItem(key);

    return value !== null ? JSON.parse(value) : undefined;
  },
  set(target, p, newValue, receiver)
  {
    let key = `#${CONFIG.name.toLocaleLowerCase()}_${p.toString()}`;
    let value = JSON.stringify(newValue);

    window.localStorage.setItem(key, value);
    return true;
  }
});