import * as kLib from "../../koroLib/main/web.js";
const { Color } = kLib;

class SyncKorockle extends kLib.Korockle {
  /**@type {SyncKorockle?} */
  leftKorockle = null;
  /**@type {SyncKorockle?} */
  rightKorockle = null;
  /**@type {SyncKorockle?} */
  topKorockle = null;
  /**@type {SyncKorockle?} */
  bottomKorockle = null;
}

/**@type {SyncKorockle[]} */
let korockles = [];

async function addKorockle() {
  const korocklehid = await kLib.getKorockle();
  korockles.push(new SyncKorockle(korocklehid));
  onKorockleConnect(korockles[korockles.length - 1]);
}
/**
 * @param {SyncKorockle} korockle
 */
async function removeKorockle(korockle) {
  korockles = korockles.filter((v) => v !== korockle);
  await korockle.hid.close();
}

/**
 *
 * @param {SyncKorockle} newKorockle
 */
function onKorockleConnect(newKorockle) {
  $("#korockle-count-text").text(
    getTranslate("korockle.multi.counts")
      .replace("$", korockles.length)
      .replace("$", korockles.length === 1 ? "" : "s"),
  );
}

function check() {
  if (!navigator.hid) {
    setTimeout(() => {
      $("#connect-info").text(getTranslate("korockle.notworking"));
    }, 100);
  }
}

function initMelody() {
  $("#melody-playsync").on("click", () => {
    korockles.forEach((k) => k.melody("once"));
  });
}

$(() => {
  initMelody();
  $("#connect").on("click", () => {
    addKorockle();
  });
  $("#disconnect").on("click", () => {
    disconnect();
  });
  if (getParam().includes("ignore-korockle-connect")) {
    $("#content").removeClass("x");
  }
});
