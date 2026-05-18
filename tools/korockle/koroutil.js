import * as kLib from "../koroLib/main/web.js";

/**@type {kLib.Korockle[]} */
let unloadOnPageExitKorockles = [];
function initUnloadOnPageExit() {
  window.addEventListener("unload", () => {
    alert(unloadOnPageExitKorockles);
    for (const k of unloadOnPageExitKorockles) {
      k.hid.close();
    }
  });
}

/**
 * @param {kLib.Korockle[]} newArray
 */
function setUnloadOnPageExitKorocklesList(newArray) {
  unloadOnPageExitKorockles = newArray;
}

export { initUnloadOnPageExit, setUnloadOnPageExitKorocklesList };
