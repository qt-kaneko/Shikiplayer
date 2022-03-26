// This file is part of Shikiplayer.
//
// Shikiplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Shikiplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Shikiplayer. If not, see <https://www.gnu.org/licenses/>.
// Copyright 2022 Kaneko Qt

/*export*/ function isAnimePage(pathname) {
  const isAnimePageRegEx = /\/animes\/z?(?<id>[0-9]+)-([a-z0-9]+-?)+$/;

  return pathname.match(isAnimePageRegEx);
}

/*export*/ function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}