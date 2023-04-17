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
 * @template {Function} T
 * @param {T} t
 * @param {string} selector
 * @param {ParentNode} element
 * @returns {T["prototype"]}
 */
//@ts-ignore
const querySelector = (selector, element = document, t = HTMLElement) =>
{
  let result = element.querySelector(selector);

  if (result !== null)
  {
    if (!is(result, t)) raise(Error(`Element found but it's type is wrong.`));
  }
  else raise(new Error(`Element not found.`));

  return result;
};

/**
 * @template {Function} T
 * @param {T} t
 * @param {string} selector
 * @param {ParentNode} element
 * @returns {T["prototype"] | null}
 */
//@ts-ignore
const querySelectorNull = (selector, element = document, t = HTMLElement) =>
{
  let result = element.querySelector(selector);

  if (result !== null)
  {
    if (!is(result, t)) raise(Error(`Element found but it's type is wrong.`));
  }

  return result;
};

/**
 * @template {Function} T
 * @param {T} t
 * @param {string} selector
 * @param {ParentNode} element
 * @returns {T["prototype"] | null}
 */
//@ts-ignore
const querySelectorAll = (selector, element = document, t = HTMLElement) =>
{
  let result = element.querySelectorAll(selector);

  if (result.length === 0) raise(new Error(`Element not found.`));
  if (Array(...result).some((found) => !is(found, t))) raise(Error(`Element found but it's type is wrong.`));

  return result;
};