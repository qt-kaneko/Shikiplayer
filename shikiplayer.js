// This file is part of Shikiplayer.
//
// Shikiplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Shikiplayer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Shikiplayer. If not, see <https://www.gnu.org/licenses/>.
// Copyright 2022 Kaneko Qt

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;

    location.reload(); // Make shikimori reload f@cking page when it changes (҂｀ﾛ´)凸
  }
}).observe(document, { subtree: true, childList: true });

const isAnimePageRegEx = /https?:\/\/shikimori.one\/animes\/[0-9-a-z]*$/;
if (isAnimePageRegEx.test(window.location.href)) {
  const idExtractorRegEx = /(?<=https?:\/\/shikimori.one\/animes\/)[0-9]*?(?=-)/;

  const id = idExtractorRegEx.exec(location.href)[0];

  const block = document.createElement("div");
  block.className = "block";

  const subheadline = document.createElement("div");
  subheadline.className = "subheadline";
  subheadline.appendChild(document.createTextNode("СМОТРЕТЬ"))
  block.appendChild(subheadline);

  const player = document.createElement("iframe");
  player.id = "player";
  player.src = `https://kodikdb.com/find-player?shikimoriID=${id}`; //&season=1&only_season=true
  player.scrolling = "no";
  player.allowFullscreen = true;
  block.appendChild(player);

  const before = document.getElementsByClassName("b-db_entry")[0];

  insertAfter(block, before);

  window.addEventListener("resize", onResize);
  onResize();

  function onResize() {
    player.width = player.parentNode.clientWidth;
    player.height = 9 * player.width / 16;
  }
}