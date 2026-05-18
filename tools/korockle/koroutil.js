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

function initKorockleConnectingInfo() {
  if (!navigator.hid) {
    PageLoadEventTarget.addEventListener("translateEnd", () => {
      $("#connect-info").text(getTranslate("korockle.notworking"));
    });
  }
}

export {
  initUnloadOnPageExit,
  setUnloadOnPageExitKorocklesList,
  initKorockleConnectingInfo,
};
