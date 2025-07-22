/**@type {JQuery<HTMLBodyElement>} */
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
 * min以上max未満の整数乱数。
 * @returns {number}
 * @param {number} max
 * @param {number} min
 */
function random(max, min = 0) {
  const rand = Math.floor(Math.random() * (max - min) + min);
  //運がめっちゃよかったらジャスト1を引くことがある
  if (rand === max) return max - 1;
  return rand;
}

/**
 * arrからランダムで1つ抽出する。\
 * コード上は文字列でもいけそう
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function randomFromArray(arr) {
  return arr[random(arr.length)];
}

/**
 * arrayをlength個の要素で区切る。
 * @template T
 * @param {T[]} array
 * @param {number} length
 * @returns {T[][]}
 */
function separateArray(array, length) {
  /**@type {T[][]} */
  const newArr = [];
  for (let i = 0; i < array.length; i += length) {
    newArr.push(array.slice(i, i + length));
  }
  return newArr;
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
 * @returns {string}
 */
function getTranslate(key) {
  let k = key;
  const isTranslateMarked = k.startsWith("@");
  if (isTranslateMarked) k = k.slice(1);
  if (k in translateJson) return translateJson[k];
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

/**
 * https://developer.mozilla.org/ja/docs/Glossary/Base64#%E3%80%8Cunicode_%E5%95%8F%E9%A1%8C%E3%80%8D
 * @param {Uint8Array|number[]} bytes
 */
function bytesToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");
  return btoa(binString);
}
/**
 * https://developer.mozilla.org/ja/docs/Glossary/Base64#%E3%80%8Cunicode_%E5%95%8F%E9%A1%8C%E3%80%8D
 * @param {string} base64
 */
function base64ToByte(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

/**
 * 文字列をutf-8で数列に変換する
 * @param {string} str
 */
function stringToByte(str) {
  const encorder = new TextEncoder();
  return Array.from(encorder.encode(str));
}
/**
 * 数列をutf-8で文字列に変換する
 * @param {Uint8Array<ArrayBuffer>} bytes
 */
function ByteToString(bytes) {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
/**
 * urlの中身をダウンロードする
 * @param {string} url
 * @param {string} filename
 */
function downloadUrl(url, filename) {
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
}
/**
 * テキストをダウンロードする
 * @param {string} text
 * @param {string} filename
 */
function downloadText(text, filename = "text") {
  downloadUrl(
    `data:text/plain;charset=utf-8;base64,` + bytesToBase64(stringToByte(text)),
    filename
  );
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
