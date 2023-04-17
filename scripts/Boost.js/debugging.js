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

/**
 * @param {any[]} data
 */
const log = (...data) =>
  console.log(`[${CONFIG.name}]`, ...data);

/**
 * @param {any} label
 */
const logGroup = (label, collapsed = true) =>
{
  return {
    active: false,
    /**
    * @param {any[]} data
    */
    log: function(...data) {
      if (!this.active)
      {
        if (collapsed) console.groupCollapsed(`[${CONFIG.name}]`, label);
        else console.group(`[${CONFIG.name}]`, label);

        this.active = true;
      }

      log(...data);
    },
    end: () => console.groupEnd()
  };
};

/** Raises error printing stack trace because one awesome browser that absolutely is not Firefox doesn't print it.
 * @param {Error} error
 * @returns {never}
 */
const raise = (error) =>
{
  console.error(`[${CONFIG.name}]`, error);
  throw error;
};