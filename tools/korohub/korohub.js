import * as kLib from "../korockle/web.js";
const { Color } = kLib;

/**
 * @type {kLib.Korockle}
 */
let korockle = null;

async function connect() {
  if (!!korockle) return;
  const korocklehid = await kLib.getKorockle();
  korockle = new kLib.Korockle(korocklehid);
  $("#content").removeClass("x");
  $("#connectgui").hide();
}
async function disconnect() {
  await korockle.hid.close();
  location.reload();
}
function check() {
  if (!navigator.hid) {
    setTimeout(() => {
      alert(getTranslate("korockle.notworking"));
    }, 100);
  }
}
function generateConstColorSelector() {
  [...$(".constcolor-selector")].forEach((el) => {
    Object.entries(kLib.ConstColor)
      .map((kv) =>
        $(
          `<option value="${kv[1]}">${getTranslate(
            `korockle.constcolor.${kv[0]}`
          )}</option>`
        )
      )
      .forEach((v) => {
        el.appendChild(v[0]);
      });
  });
}

function generateSoundSelector() {
  const s = (n) =>
    `<option value="${n}"><span>@words.sound</span>${n}</option>`;
  $(".sound-selector").html(
    s(1) +
      s(2) +
      s(3) +
      `<option value="4">@korockle.sound.melody.play</option>`
  );
}

/**
 * @param {1|2|3|4} v
 */
function isVaildSound(v) {
  return v === 1 || v === 2 || v === 3 || v === 4;
}

function generateCode() {
  return generateCodeFromValues(
    parseInt($("#focus-minute").val()),
    parseInt($("#break-minute").val()),
    Color.fromConstColor(parseInt($("#focus-color").val())),
    Color.fromConstColor(parseInt($("#break-color").val())),
    parseInt($("#focus-sound").val()),
    parseInt($("#break-sound").val()),
    parseInt($("#alerm-sound").val()),
    parseInt($("#time-showtime").val()),
    parseInt($("#temp-showtime").val()),
    Color.fromRGB($("#led-color").val().substring(1)),
    Color.fromConstColor(parseInt($("#setting-led").val())),
    Color.fromConstColor(parseInt($("#setting-timer").val()))
  );
}

/**
 *
 * @param {number} timerFocusMinute
 * @param {number} timerBreakMinute
 * @param {kLib.Color} timerFocusColor
 * @param {kLib.Color} timerBreakColor
 * @param {1|2|3|4} timerFocusSound
 * @param {1|2|3|4} timerBreakSound
 * @param {1|2|3|4} alermSound
 * @param {number} timeShowTime
 * @param {number} tempShowTime
 * @param {kLib.Color} ledColor
 * @param {kLib.Color} settingLedColor
 * @param {kLib.Color} settingTimerColor
 * @returns {number[]|string}
 */
function generateCodeFromValues(
  timerFocusMinute,
  timerBreakMinute,
  timerFocusColor,
  timerBreakColor,
  timerFocusSound,
  timerBreakSound,
  alermSound,
  timeShowTime,
  tempShowTime,
  ledColor,
  settingLedColor,
  settingTimerColor
) {
  if (timerFocusColor.constColor() === 0)
    return "@korohub.error.timerFocusColor";
  if (timerBreakColor.constColor() === 0)
    return "@korohub.error.timerBreakColor";
  if (settingLedColor.constColor() === 0)
    return "@korohub.error.settingLedColor";
  if (settingTimerColor.constColor() === 0)
    return "@korohub.error.settingTimerColor";
  if (timerFocusMinute > 127 || timerFocusMinute < 1)
    return "@korohub.error.timerFocusMinute";
  if (timerBreakMinute > 127 || timerBreakMinute < 1)
    return "@korohub.error.timerBreakMinute";
  if (timeShowTime > 255 || timeShowTime < 1)
    return "@korohub.error.timeShowTime";
  if (tempShowTime > 255 || tempShowTime < 1)
    return "@korohub.error.tempShowTime";
  if (!isVaildSound(timerFocusSound)) return "@korohub.error.timerFocusSound";
  if (!isVaildSound(timerBreakSound)) return "@korohub.error.timerBreakSound";
  if (!isVaildSound(alermSound)) return "@korohub.error.alermSound";
  const v = {
    timeShowTime,
    tempShowTime,
    timerFocusColor: timerFocusColor.constColor() + 3,
    alermSound: alermSound + 35,
    timerFocusMinute,
    timerBreakMinute,
    timerFocusSound: timerFocusSound + 35,
    timerBreakSound: timerBreakSound + 35,
    timerBreakColor: timerBreakColor.constColor() + 3,
    settingLedColor: settingLedColor.constColor() + 3,
    settingTimerColor: settingTimerColor.constColor() + 3,
    timerFocusColorDarking: timerFocusColor.constColor() + 2,
    ledColor1: ledColor.red,
    ledColor2: ledColor.green,
    ledColor3: ledColor.blue,
  };
  return [
    1,
    26,
    46,
    5,
    8,
    78,
    8,
    31,
    78,
    11,
    91,
    47,
    19,
    11,
    76,
    2,
    0,
    77,
    30,
    42,
    22,
    1,
    103,
    24,
    35,
    17,
    79,
    14,
    0,
    255,
    2,
    79,
    45,
    7,
    0,
    76,
    47,
    v.timeShowTime,
    77,
    53,
    76,
    50,
    v.tempShowTime,
    77,
    55,
    97,
    35,
    78,
    38,
    231,
    78,
    43,
    231,
    98,
    40,
    69,
    83,
    75,
    7,
    0,
    99,
    63,
    0,
    69,
    68,
    70,
    2,
    1,
    v.timerBreakColor,
    72,
    v.timerFocusColor,
    72,
    42,
    90,
    20,
    69,
    80,
    90,
    7,
    1,
    78,
    90,
    148,
    68,
    60,
    88,
    0,
    255,
    103,
    90,
    2,
    61,
    94,
    100,
    97,
    96,
    v.alermSound,
    98,
    10,
    91,
    69,
    105,
    133,
    0,
    0,
    69,
    110,
    143,
    2,
    1,
    79,
    114,
    2,
    0,
    79,
    126,
    0,
    v.timerFocusMinute,
    79,
    128,
    0,
    v.timerBreakMinute,
    v.timerBreakColor,
    130,
    v.timerFocusColor,
    130,
    v.timerFocusSound,
    124,
    v.timerBreakSound,
    122,
    46,
    137,
    130,
    65,
    139,
    147,
    59,
    45,
    147,
    85,
    137,
    0,
    1,
    79,
    118,
    2,
    1,
    2,
    99,
    151,
    7,
    v.settingLedColor,
    153,
    46,
    156,
    153,
    42,
    159,
    3,
    46,
    209,
    189,
    v.settingTimerColor,
    164,
    46,
    167,
    164,
    42,
    170,
    3,
    46,
    173,
    230,
    79,
    177,
    0,
    v.timerFocusMinute,
    99,
    206,
    0,
    46,
    183,
    180,
    42,
    186,
    5,
    46,
    196,
    193,
    82,
    162,
    7,
    1,
    v.timerFocusColorDarking,
    204,
    5,
    79,
    202,
    0,
    255,
    43,
    230,
    44,
    230,
    45,
    200,
    47,
    180,
    206,
    47,
    228,
    209,
    6,
    222,
    v.ledColor1,
    v.ledColor2,
    v.ledColor3,
    76,
    212,
    0,
    104,
    230,
    78,
    225,
    91,
    42,
    220,
    1,
    103,
    217,
    2,
    69,
    252,
    236,
    7,
    1,
    47,
    239,
    243,
    79,
    252,
    7,
    2,
    69,
    248,
    252,
    7,
    2,
    79,
    252,
    7,
    1,
    42,
    255,
    1,
    2,
  ];
}

async function apply() {
  const ans = generateCode();
  if (typeof ans === "string") {
    $("#answer").text(ans);
  } else {
    if (!korockle) return;
    if (ans.length > 256) {
      $("#answer").text(
        "コードが256バイトを超えたため、書き込むことができません。"
      );
    }
    $("#answer").text("書き込んでいます...");
    await korockle.writeProgram(ans);
    $("#answer").text("書き込みました。Enjoy!");
  }
}

$(() => {
  generateSoundSelector();
  check();
  $("#connect").on("click", () => {
    connect();
  });
  $("#disconnect").on("click", () => {
    disconnect();
  });
  $("#apply").on("click", () => {
    apply();
  });
  if (getParam().includes("ignore-korockle-connect")) {
    $("#content").removeClass("x");
  }
  setTimeout(() => {
    generateConstColorSelector();
    $("#focus-color").val(kLib.ConstColor.WHITE);
    $("#break-color").val(kLib.ConstColor.GREEN);
    $("#setting-led").val(kLib.ConstColor.WHITE);
    $("#setting-timer").val(kLib.ConstColor.YELLOW);
    $("#alerm-sound").val(3);
  }, 1000);
});
