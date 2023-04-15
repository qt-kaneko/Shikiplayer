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
 * @template T
 * @param {T} value
 * @returns {NonNullable<T>}
 */
const notnull = (value) =>
  value !== undefined && value !== null
    ? value
    : raise(new TypeError(`Object reference not set to an instance of an object.`));

/** 
 * @template {Function} T
 * @param {T} type
 * @param {any} value
 * @returns {T["prototype"]}
 */
const cast = (value, type) =>
{
  notnull(value);

  return is(value, type)
    ? value
    : raise(new TypeError(`Unable to cast object of type '${value.constructor.name}' to type '${type.name}'`));
};

/** 
 * @template {Function} T
 * @param {T} type
 * @param {any} value
 * @returns {boolean}
 */
const is = (value, type) =>
{
  notnull(value);

  let valueProto = (() => {switch (typeof value) {
    case `bigint`: return BigInt.prototype;
    case `boolean`: return Boolean.prototype;
    case `function`: return Function.prototype;
    case `number`: return Number.prototype;
    case `object`: return Object.getPrototypeOf(value);
    case `string`: return String.prototype;
    case `symbol`: return Symbol.prototype;
  }})();

  return valueProto.constructor === type || valueProto instanceof type;
};