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
    }
  }
}
function initTextConversion() {
  text = $("#text-conversion");
  $("#text-clear").on("click", () => {
    text.val("");
  });
  $("#text-copy").on("click", (ev) => {
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
    let filename =
      prompt(getTranslate("tools.download.filename")) ?? "file.txt";
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
}
$(() => {
  initTextConversion();
});
