//TODO: ドキュメントの描画の段階ごとにイベントによって状態を管理する
const ISDEBUG = getParam().includes("dev");
/**@type {PageLoadEventTarget} */
const PageLoadEventTarget = new EventTarget();

/**@type {JQuery<HTMLBodyElement>} */
let BODY;
let Version = "0.0.0";
/**@type {Dictionary<string,string>} */
let translateJson = {};
let translateLang = "";
/**@type {"d"|"l"} */
let theme = "";
/**@type {Set<string>} */
const noTranslatedTexts = new Set();
const TRANSLATE_KEYS = ["ja", "en"];
const TRANSLATE_KEYS_LAST = TRANSLATE_KEYS[TRANSLATE_KEYS.length - 1];
function _DEV() {
  const param = getParam();
  if (param.includes("dev"))
    setParam(
      param.filter((v) => v !== "dev"),
      true,
    );
  else setParam(["dev", ...param], true);
}

/**
 * 文字列がオブジェクトであるか判断する。
 * @param {string} str
 */
function isObjectString(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (ex) {
    return false;
  }
}

/**
 * localStorageからデータを取得する。\
 * デバッグの場合ログを出し、値がない場合デフォルト値を出力する。\
 * オブジェクトと判断されたかつobjTranslateがfalseでない場合はオブジェクトに変換する。
 * @param {string} key
 * @param {any} ifNull
 */
function getStorage(key, ifNull = null, objTranslate = true) {
  const value = localStorage.getItem(key) ?? ifNull;
  if (getParam().includes("dev"))
    styledLog(`%cStorage:GET%c${key} >%r${value}`, [
      "!C:black;!B:#1aa;!PA:1px 4px",
      "!C:white;!B:#522;!PA:1px 4px",
    ]);
  if (objTranslate && isObjectString(value)) return JSON.parse(value);
  return value;
}

/**
 * localStorageにデータを書き込む。\
 * デバッグの場合ログを出す。\
 * 値がオブジェクトかつobjTranslateがfalseでない場合は文字列に変換する。
 * @param {string} key
 * @param {any} value
 */
function setStorage(key, value = null, objTranslate = true) {
  let writeVal = value;
  if (objTranslate && typeof value !== "string")
    writeVal = JSON.stringify(value);
  if (getParam().includes("dev"))
    styledLog(`%cStorage:SET%c${key} >%r${writeVal}`, [
      "!C:white;!B:#a1a;!PA:1px 4px",
      "!C:white;!B:#522;!PA:1px 4px",
    ]);
  localStorage.setItem(key, writeVal);
  return writeVal;
}
/**
 * 上部に表示するバーを生成する。
 */
function genTopBar() {
  fetch("/components/topbar.htmltemplate").then(async (v) => {
    BODY.prepend(await v.text());
    /**@type {GeneratedTopBarEvent} */
    const event = new Event("generatedTopBar", { cancelable: false });
    PageLoadEventTarget.dispatchEvent(event);
  });
}
/**
 * 右部に表示するバーを生成する。
 */
function genRightbar() {
  fetch("/components/rightbar.htmltemplate").then(async (v) => {
    BODY.prepend(await v.text());
    /**@type {GeneratedRightBarEvent} */
    const event = new Event("generatedRightBar", { cancelable: false });
    PageLoadEventTarget.dispatchEvent(event);
  });
}
/**
 * テーマをデバイス色、もしくはlocalStorage.m.themeに設定する。
 */
function setTheme() {
  const storage = getStorage("m.theme");
  if (storage === "d") changeTheme();
  if (!storage) {
    const dark =
      matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) changeTheme();
  }
  let nowIsDark = $("body").hasClass("dark");
  theme = nowIsDark ? "d" : "l";
  /**@type {ThemeloadEvent} */
  const event = new Event("themeload", { cancelable: false });
  PageLoadEventTarget.dispatchEvent(event);
}
/**
 * テーマを変更する。
 */
function changeTheme(save = true) {
  const bo = $("body");
  let nowIsDark = bo.hasClass("dark");
  if (nowIsDark) $("body").removeClass("dark");
  else $("body").addClass("dark");
  if (save) {
    setStorage("m.theme", nowIsDark ? "l" : "d");
  }
  theme = nowIsDark ? "l" : "d";
  /**@type {ThemeloadEvent} */
  const event = new Event("themeload", { cancelable: false });
  PageLoadEventTarget.dispatchEvent(event);
}
/**
 * min以上max未満の整数乱数。
 * @returns {number}
 * @param {number} max
 * @param {number} min
 */
function random(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min);
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
 * デバッグモードの場合、翻訳できなかったテキストをリストに入れる。
 * または、リストからJSONを取得する。
 * @param {string?} key
 */
function Dev_NoTranslated(key) {
  if (!ISDEBUG) return;
  if (!!key) {
    if (key.startsWith("@")) key = key.slice(1);
    noTranslatedTexts.add(key);
    return;
  }
  let data = "";
  noTranslatedTexts.forEach((k) => (data += `"${k}": "",\n`));
  console.log(data);
}
/**
 * デバッグモードの場合、翻訳できなかったテキストをリストに入れる。
 * または、リストからJSONを取得する。
 * @param {string} key
 * @param {string} at
 */
function Dev_TranslatedLog(key, at) {
  if (!ISDEBUG) return;
  styledLog(`%cTranslated%r %c"${key}"%r > %c"${at}"`, [
    "!C:black;!B:yellow;!PA:1px 3px",
    "!C:red",
    "!C:green",
  ]);
}

/**
 * 翻訳キーを用いて翻訳を行う。
 * @param {string} lang
 * @param {HTMLElement[]} targetElements?
 */
async function translate(lang, targetElements = null) {
  if (!targetElements) {
    const json = await (await fetch(`/langs/${lang}.json`)).json();
    translateJson = json;
    translateLang = lang;
    translateJson.version = Version;
    /**@type {TranslateStartEvent} */
    const startEvent = new Event("translateStart", { cancelable: true });
    if (!PageLoadEventTarget.dispatchEvent(startEvent)) {
      styledLog(`%c[!] Translate Canceled`, ["!C:black;!B:#c33;!PA:1px 3px"]);
      return;
    }
  }
  const defaultTarget = [
    ...$("div"),
    ...$("a"),
    ...$("button"),
    ...$("span"),
    ...$("li"),
    ...$("option"),
    ...$("label"),
    ...$("p"),
  ];
  const translates = !targetElements ? defaultTarget : targetElements;
  function translateOne(k) {
    //虚無や非対象は飛ばす
    if (!k) return k;
    if (!k.length === 0) return k;
    if (!k.startsWith("@")) return k;
    return getTranslate(k);
  }
  translates.forEach((j) => {
    if (j.innerHTML.includes("<")) return;
    j.innerText = translateOne(j.innerText);
  });
  [...$("input")].forEach((e) => {
    e.placeholder = translateOne(e.placeholder ?? "");
  });
  if (!targetElements) {
    /**@type {TranslateEndEvent} */
    const endEvent = new Event("translateEnd", { cancelable: false });
    PageLoadEventTarget.dispatchEvent(endEvent);
  }
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
  if (k in translateJson) {
    const at = translateJson[k];
    Dev_TranslatedLog(k, at);
    return at;
  } else {
    Dev_NoTranslated(k);
    return `${isTranslateMarked ? "@" : ""}${k}`;
  }
}

/**
 * url/videoIDからYoutubeの埋め込みのHTMLを取得する
 * // TODO: 処理を共通化
 * @param {string} url
 */
function youtubeUrlToEmbed(url) {
  const EMBED_BASE = `<iframe width="560" height="315" src="https://www.youtube.com/embed/%VIDEO_ID%" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  function getVideoId() {
    const shortLink = /http(?:s?)\:\/\/youtu\.be\/([0-9a-zA-z_\-]+)/;
    const normalLink =
      /http(?:s?)\:\/\/www\.youtube\.com\/watch\?v=([0-9a-zA-z_\-]+)/;
    const videoIdExec = shortLink.exec(url) ?? normalLink.exec(url);
    if (!videoIdExec) return null;
    return videoIdExec[1];
  }
  const videoId = url.includes("/") ? getVideoId() : url;
  if (/((?:sm|so)[0-9]+)/.test(url)) return null;
  if (!videoId) return null;
  return EMBED_BASE.replace(/%VIDEO_ID%/g, videoId);
}
/**
 * url/videoIDからニコ動の埋め込みのHTMLを取得する
 * // TODO: 処理を共通化
 * @param {string} url
 */
function nicoVideoUrlToEmbed(url, isVideo = false) {
  const EMBED_BASE_VIDEO = `<iframe width="560" height="315" src="http://embed.nicovideo.jp/watch/%VIDEO_ID%"></iframe>`;
  const EMBED_BASE = `<iframe width="560" height="206" src="https://ext.nicovideo.jp/thumb/%VIDEO_ID%" scrolling="no"style="border:solid 1px #ccc;" frameborder="0"><a href="https://www.nicovideo.jp/watch/%VIDEO_ID%">_</a></iframe>`;
  function getVideoId() {
    const link =
      /http(?:s?)\:\/\/(?:www.)?nicovideo.jp\/watch\/((?:sm|so)[0-9]+)/;
    const videoIdExec = link.exec(url);
    if (!videoIdExec) return null;
    return videoIdExec[1];
  }
  const videoId = url.includes("/") ? getVideoId() : url;
  if (!videoId) return null;
  return (isVideo ? EMBED_BASE_VIDEO : EMBED_BASE).replace(
    /%VIDEO_ID%/g,
    videoId,
  );
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
    String.fromCodePoint(byte),
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
  if (getParam().includes("dev"))
    styledLog(`%cDownload%c${filename}%c ${url}`, [
      "!C:white;!B:#744;!PA:1px 4px",
      "!PA:1px 4px;!B:black;!C:white",
      "",
    ]);
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
    filename,
  );
}

/**
 * `"abc"`に対して`{a:"an ",c:"anana"}`と与えると`"an banana"`が返ってくる
 * @param {string} text
 * @param {Object} replaceObject
 */
function strReplaceObject(text, replaceObject) {
  Object.entries(replaceObject).forEach((kv) => {
    text = text.replaceAll(kv[0], kv[1]);
  });
  return text;
}

/**
 * inputにファイルが設定されたらテキストファイルとして解釈しfuncを実行する
 * @param {HTMLInputElement} input
 * @param {(text:string,name:string)=>void} func
 */
function onFileSelected(input, func) {
  input.addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      func(reader.result, file.name);
      input.value = "";
    };
    reader.readAsText(file);
  });
}

/**
 * 配列の特定位置に要素を追加する。
 * @template T
 * @param {T[]} arr
 * @param {T} val
 * @param {number} index
 */
function pushArrAjustIndex(arr, val, index) {
  return [...arr.slice(0, index), val, ...arr.slice(index)];
}

/**
 * console.logの上位互換もどき。\
 * %c: スタイルを適用\
 * スタイルの省略: `!C=color, !B=background-color, !BR=border-radius, !PA=padding, !BO=border, !F=font-size`\
 * %r: スタイルを通常に戻す
 * @param {string} text
 * @param {string[]} paramsStyled
 */
function styledLog(text, paramsStyled) {
  let pos = 0;
  let index = 0;
  let params = [text.replace(/%r/g, "%c")];
  function checkNext() {
    const c = text.indexOf("%c", pos);
    const r = text.indexOf("%r", pos);
    if (c === r && c === -1) return false;
    if ((c < r || r === -1) && c !== -1) {
      pos = c + 1;
      return "c";
    }
    if ((r < c || c === -1) && r !== -1) {
      pos = r + 1;
      return "r";
    }
  }
  /**
   * @param {string} css
   */
  function style(css) {
    return css
      .replace(/!C/g, "color")
      .replace(/!B/g, "background-color")
      .replace(/!BR/g, "border-radius")
      .replace(/!PA/g, "padding")
      .replace(/!BO/g, "border")
      .replace(/!F/g, "font-size");
  }

  let check = checkNext();
  while (check) {
    if (check === "r") {
      params.push("");
    } else {
      params.push(style(paramsStyled[index]));
      index++;
    }
    check = checkNext();
  }
  console.log(...params);
}

/**
 * package.jsonからバージョンを取得する。返り値は基本使用せず、Version変数から取得するのが普通。
 */
async function getVersion() {
  const res = await fetch("/package.json");
  const json = await res.json();
  Version = json.version;
  /**@type {VersionloadEvent} */
  const event = new Event("versionload", { cancelable: false });
  PageLoadEventTarget.dispatchEvent(event);
  return json.version;
}
/**
 * 開始時のログ。景気づけ。
 */
function logStartMessage() {
  const styleDef = "!C:#fff;!F:20px;!PA:5px 10px;";
  const isDev = getParam().includes("dev") ? "%cDev" : "";
  styledLog(`%cmanmen2414.github.io%cVersion ${Version}${isDev}`, [
    styleDef + "!B:#33b;",
    styleDef + "!B:#774;",
    styleDef + "!B:#944;",
  ]);
}

$(async () => {
  BODY = $("body");
  await getVersion();
  logStartMessage();
  const page = window.mameeennPageSettings ?? {};
  if (!page.noTopBar) genTopBar();
  if (!page.noRightBar) genRightbar();
  if (!page.noTheme) setTheme();
  if (!page.noTranslate) translateParam();
});
