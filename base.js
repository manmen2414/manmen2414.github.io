/**@type {JQuery<HTMLElement>} */
let BODY;
let translateJson = {};
const TRANSLATE_KEYS = ["ja", "en"];
const TRANSLATE_KEYS_LAST = TRANSLATE_KEYS[TRANSLATE_KEYS.length - 1];
/**
 * 上部に表示するバーを生成する。
 */
function genTopBar() {
  fetch("/components/topbar.htmltemplate").then(async (v) => {
    BODY.prepend(await v.text());
  });
}
/**
 * 右部に表示するバーを生成する。
 */
function genRightbar() {
  fetch("/components/rightbar.htmltemplate").then(async (v) => {
    BODY.prepend(await v.text());
  });
}
/**
 * テーマをデバイス色に設定する。
 */
function setTheme() {
  const dark = matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) changeTheme();
}
/**
 * テーマを変更する。
 */
function changeTheme() {
  const bo = $("body");
  if (bo.hasClass("dark")) {
    bo.removeClass("dark");
  } else {
    bo.addClass("dark");
  }
}
/**
 * 翻訳キーを用いて翻訳を行う。
 * @param {string} lang
 */
async function translate(lang) {
  const json = await (await fetch(`/langs/${lang}.json`)).json();
  translateJson = json;
  const translates = [
    ...$("div"),
    ...$("a"),
    ...$("button"),
    ...$("span"),
    ...$("li"),
  ];
  translates.forEach((j) => {
    const k = j.innerText;
    //虚無や非対象は飛ばす
    if (!k) return;
    if (!k.length === 0) return;
    if (!k.startsWith("@")) return;
    //HTML持ちも飛ばす
    if (j.innerHTML.includes("<")) return;
    if (k.slice(1) in json) j.innerText = json[k.slice(1)];
  });
}
/**
 * 翻訳キーから翻訳結果を取得する。
 * @param {string} key
 */
function getTranslate(key) {
  let k = key;
  const isTranslateMarked = k.startsWith("@");
  if (isTranslateMarked) k = k.slice(1);
  if (k in json) return json[k];
  return `${isTranslateMarked ? "@" : ""}${k}`;
}
/**
 * パラメータを取得する。
 * @returns {string[]}
 */
function getParam() {
  const hash = location.hash;
  if (hash.length === 0) return [];
  return hash.slice(1).split("&");
}
/**
 * 配列からパラメータを適用する。
 * @param {string[]} arr
 */
function setParam(arr, reload = false) {
  location.hash = "#" + arr.join("&");
  if (reload) location.reload();
}
/**
 * URLのパラメータから翻訳キーを取得する。
 */
function translateParam() {
  const lang = getParam().find((v) => TRANSLATE_KEYS.includes(v));
  translate(lang ?? TRANSLATE_KEYS[0]);
}
/**
 * 言語を変更する。
 */
function changeLanguage() {
  const param = getParam();
  const lang = TRANSLATE_KEYS.findIndex((v) => param.includes(v));
  if (lang === -1) {
    param.push(TRANSLATE_KEYS_LAST);
    setParam(param, true);
  } else {
    let newparam = param.filter((v) => v !== TRANSLATE_KEYS[lang]);
    newparam.push(TRANSLATE_KEYS[(lang + 1) % TRANSLATE_KEYS.length]);
    setParam(newparam, true);
  }
}
$(() => {
  BODY = $("body");
  genTopBar();
  genRightbar();
  setTheme();
  translateParam();
  setTimeout(() => {
    translateParam();
  }, 100);
});
