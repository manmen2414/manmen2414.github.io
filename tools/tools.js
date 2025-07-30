/**@type {JQuery<HTMLTextAreaElement>} */
let text = null;
const convertFunctions = {
  jsonFormat() {
    const data = safeJsonParse(text.val());
    if (!!data.error) {
      let translate = getTranslate("tools.json-formatter.error");
      translate = translate.replace("$", data.error.line);
      translate = translate.replace("$", data.error.char);
      alert(translate);
      return;
    }
    text.val(JSON.stringify(data.json, (key, value) => value, 2));
  },
  jsonMinify() {
    const data = safeJsonParse(text.val());
    if (!!data.error) {
      let translate = getTranslate("tools.json-formatter.error");
      translate = translate.replace("$", data.error.line);
      translate = translate.replace("$", data.error.char);
      alert(translate);
      return;
    }
    text.val(JSON.stringify(data.json));
  },
  unicodeEncode() {
    text.val(
      text
        .val()
        .replace(
          /[^\x00-\x7F]/g,
          (c) => "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4)
        )
    );
  },
  unicodeDecode() {
    text.val(
      text
        .val()
        .replace(/\\u([a-fA-F0-9]{4})/g, (x, y) =>
          String.fromCharCode(parseInt(y, 16))
        )
    );
  },
  base64Encode() {
    text.val(bytesToBase64(stringToByte(text.val())));
  },
  base64Decode() {
    text.val(ByteToString(base64ToByte(text.val())));
  },
  base64DataUrl() {
    this.base64Encode();
    text.val("data:text/plain;charset=utf-8;base64," + text.val());
  },
  sjisToUtf8() {
    const sjisDec = new TextDecoder("shift-jis");
    const utf8Dec = new TextDecoder("utf-8");
    //#region https://qiita.com/dopperi46/items/49441391fa0e3beae3da
    const table = { "\u00a5": 0x5c, "\u203e": 0x7e, "\u301c": 0x8160 };
    for (let i = 0x81; i <= 0xfc; i++) {
      if (
        i <= 0x84 ||
        (i >= 0x87 && i <= 0x9f) ||
        (i >= 0xe0 && i <= 0xea) ||
        (i >= 0xed && i <= 0xee) ||
        i >= 0xfa
      )
        for (let j = 0x40; j <= 0xfc; j++) {
          const c = sjisDec.decode(new Uint8Array([i, j]));
          if (c.length === 1 && c !== "\ufffd" && !table[c]) {
            table[c] = (i << 8) | j;
          }
        }
    }
    const utf8Text = text.val();
    const buffer = [];
    for (let i = 0; i < utf8Text.length; i++) {
      const c = utf8Text.codePointAt(i);
      if (c > 0xffff) i++;

      if (c < 0x80) buffer.push(c);
      else if (c >= 0xff61 && c <= 0xff9f) buffer.push(c - 0xfec0);
      else {
        const d = table[String.fromCodePoint(c)] || 0x3f;
        if (d > 0xff) buffer.push((d >> 8) & 0xff, d & 0xff);
        else buffer.push(d);
      }
    }
    //#endregion
    text.val(utf8Dec.decode(Uint8Array.from(buffer)));
  },
  utf8ToSjis() {
    const sjisDec = new TextDecoder("shift-jis");
    const utf8Enc = new TextEncoder();
    text.val(sjisDec.decode(utf8Enc.encode(text.val())));
  },
};
/**
 * @returns {{json:object?,error:{line:number,char:number}?}}
 * @param {string} value
 */
function safeJsonParse(value) {
  try {
    return { json: JSON.parse(value) };
  } catch (ex) {
    /**@type {string} */
    const message = ex.message;
    const jsonMissMessage = /at line ([0-9]+) column ([0-9]+) of the JSON data/;
    const execData = jsonMissMessage.exec(message);
    if (execData) {
      return {
        error: { line: parseInt(execData[1]), char: parseInt(execData[2]) },
      };
    } else {
      return { error: { line: 0, char: 0 } };
    }
  }
}
function initTextConversion() {
  text = $("#text-conversion");
  $("#text-clear").on("click", () => {
    text.val("");
  });
  $("#text-copy").on("click", (ev) => {
    if (text.val().length === 0) return;
    navigator.clipboard.writeText(text.val()).then(
      () => {
        ev.currentTarget.innerText = "Copied!";
        setTimeout(() => {
          ev.currentTarget.innerText = "Copy";
        }, 1000);
      },
      () => {
        ev.currentTarget.innerText = "Copy Failed...";
        setTimeout(() => {
          ev.currentTarget.innerText = "Copy";
        }, 2000);
      }
    );
  });
  $("#text-download").on("click", () => {
    let filename = prompt(getTranslate("tools.download.filename"));
    if (filename === null) return;
    if (filename.length === 0) filename = "file.txt";
    downloadText(text.val(), filename);
  });
  //functions
  $("#text-json-mini").on("click", () => convertFunctions.jsonMinify());
  $("#text-json-form").on("click", () => convertFunctions.jsonFormat());
  $("#text-unicode-en").on("click", () => convertFunctions.unicodeEncode());
  $("#text-unicode-de").on("click", () => convertFunctions.unicodeDecode());
  $("#text-base64-en").on("click", () => convertFunctions.base64Encode());
  $("#text-base64-de").on("click", () => convertFunctions.base64Decode());
  $("#text-base64-url").on("click", () => convertFunctions.base64DataUrl());
  $("#text-sjis8-sjis").on("click", () => convertFunctions.utf8ToSjis());
  $("#text-sjis8-utf8").on("click", () => convertFunctions.sjisToUtf8());
}
function initNumbers() {
  /**
   * @returns {number}
   * @param {string} id
   * @param {number} def
   */
  function numVal(id, def) {
    const val = $("#" + id).val();
    if (val.length === 0) return def;
    return parseFloat(val);
  }
  //random
  $("#random-go").on("click", () => {
    let min = numVal("random-min", 1);
    let max = numVal("random-max", 100);
    const count = numVal("random-count", 1);
    const answers = [];
    if (min > max) {
      const minMin = min;
      min = max;
      max = minMin;
    }
    if (count <= 0) $("#random-answer").text("(0 ~ 0)");
    for (let i = 0; i < count; i++) {
      answers.push(random(max + 1, min));
    }
    const sum = answers.reduce((p, c) => p + c);
    //回数1なら結果だけを,2以上なら1つあたりの値と結果を表示する
    const sumStr = (count === 1 ? "" : answers.join("+") + " = ") + sum;
    const info = `${sumStr} (${min * count} ~ ${max * count})`;
    $("#random-answer").text(info);
  });
  //radix
  /**
   * @param {2|8|10|16} input
   */
  function changeBase(base) {
    const base10Value = parseInt($(`#base-${base}`).val(), base);
    const BASES = [2, 8, 10, 16];
    //変更を加えられていないinputに対し変更を加える
    BASES.filter((v) => v !== base).forEach((changeAt) => {
      const num = base10Value.toString(changeAt);
      const elem = $(`#base-${changeAt}`);
      if (isNaN(base10Value)) elem.val("");
      else elem.val(num);
    });
  }
  //各inputに適用
  [2, 8, 10, 16].forEach((v) => {
    $(`#base-${v}`).on("change", () => changeBase(v));
  });
}
function initMediaEmbed() {
  const embed = $("#mediaembed");
  $("#mediaembed-url").on("change", (ev) => {
    const val = ev.currentTarget.value;
    if (val.length === 0) {
      embed.html("");
    } else {
      embed.html(youtubeUrlToEmbed(val) ?? nicoVideoUrlToEmbed(val) ?? "");
    }
  });
}
$(() => {
  initTextConversion();
  initNumbers();
  initMediaEmbed();
});
