import { device, programLib } from "./korockle/export.js";
import Korockle from "./korockle/korockle.js";
const { Color } = programLib;

/**
 * @type {Korockle}
 */
let korockle = null;
/**
 * @type {{isButtonClicking: boolean,isLight: boolean,light: number,temp: number,isHearing: boolean,isInputing: boolean}}
 */
let korockleSensor = {
  isButtonClicking: false,
  isLight: false,
  light: 0,
  temp: 0,
  isHearing: false,
  isInputing: false,
};

async function connect() {
  if (!!korockle) return;
  const korocklehid = await device.getKorockle();
  korockle = new Korockle(korocklehid);
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

let colorvalBeforeRGB = [0, 0, 0];
let colorvalBeforeColor = "000000";
let colorvalChangeId = -1;
let colorvalGradId = -1;
function changeColor() {
  function valOr0(html) {
    const val = parseInt($(html).val());
    return isNaN(val) ? 0 : val;
  }
  const red = valOr0("#ledvalue-red");
  const green = valOr0("#ledvalue-green");
  const blue = valOr0("#ledvalue-blue");
  /**@type {string} */
  const color = $("#ledvalue-color").val().substring(1);
  const rgbArr = [red, green, blue];
  //全部同じ
  if (rgbArr.every((v, i) => colorvalBeforeRGB[i] === v)) {
    if (colorvalBeforeColor !== color) {
      colorvalBeforeColor = color;
      korockle.led(Color.fromRGB(color));
    }
  } else {
    colorvalBeforeRGB = rgbArr;
    korockle.led(new Color(...rgbArr));
  }
}
function grad() {
  const color = [0, 0, 10];
  let nowIndex = 0;
  if (colorvalChangeId === -1) {
    $("#ledvalue-grad")[0].checked = false;
    return;
  }
  colorvalGradId = setInterval(() => {
    const lastIndex = (nowIndex + 2) % 3;
    color[lastIndex]--;
    color[nowIndex]++;
    if (color[nowIndex] >= 10) {
      nowIndex = (nowIndex + 1) % 3;
    }
    korockle.led(new Color(...color));
  }, 100);
}

function initInputing() {
  setInterval(async () => {
    if (!korockle) return;
    if (colorvalChangeId !== -1) return;
    const data = await korockle.getInfo();
    korockleSensor = data;
  }, 200);
}
function initSounds() {
  $("#sound-1").on("click", () => {
    korockle.sound(1);
  });
  $("#sound-2").on("click", () => {
    korockle.sound(2);
  });
  $("#sound-3").on("click", () => {
    korockle.sound(3);
  });
  $("#melody").on("click", () => {
    const val = parseInt($("#melody-index").val());
    korockle.melody("once", isNaN(val) ? 1 : val);
  });
  $("#melody-loop").on("click", () => {
    korockle.melody("loop");
  });
  $("#melody-stop").on("click", () => {
    korockle.melody("stop");
  });
}
function initTimeAlerm() {
  $("#time-setnow").on("click", () => {
    korockle.setTimeNow();
  });
  $("#time-setnow-wait").on("click", (ev) => {
    ev.currentTarget.innerText = getTranslate("korockle.time.setnow.waiting");
    korockle.setTimeNow(true);
    setTimeout(() => {
      ev.currentTarget.innerText = getTranslate("korockle.time.setnow.wait");
    }, 4000);
  });
  $("#time-setthis").on("click", () => {
    let time = $("#time-time").val();
    if (time.length === 0) time = "00:00";
    korockle.setTime(...time.split(":").map((v) => parseInt(v)));
  });
  $("#alerm-set").on("click", () => {
    let time = $("#alerm-time").val();
    if (time.length === 0) time = "00:00";
    korockle.setAlerm(...time.split(":").map((v) => parseInt(v)));
  });
}

function initLEDs() {
  $("#led-red").on("click", () => {
    korockle.led(new Color(10, 0, 0));
  });
  $("#led-green").on("click", () => {
    korockle.led(new Color(0, 10, 0));
  });
  $("#led-blue").on("click", () => {
    korockle.led(new Color(0, 0, 10));
  });
  $("#led-black").on("click", () => {
    korockle.led();
  });
  $("#led-live").on("change", () => {
    if ($("#led-live")[0].checked) {
      colorvalChangeId = setInterval(() => {
        changeColor();
      }, 100);
    } else {
      clearInterval(colorvalChangeId);
      clearInterval(colorvalGradId);
      colorvalGradId = -1;
      colorvalChangeId = -1;
      $("#ledvalue-grad")[0].checked = false;
    }
  });
  $("#ledvalue-grad").on("change", () => {
    if ($("#ledvalue-grad")[0].checked) {
      grad();
    } else {
      clearInterval(colorvalGradId);
      colorvalGradId = -1;
    }
  });
}

$(() => {
  check();
  initInputing();
  initSounds();
  initLEDs();
  initTimeAlerm();
  $("#connect").on("click", () => {
    connect();
  });
  $("#disconnect").on("click", () => {
    disconnect();
  });
  if (getParam().includes("ignore-korockle-connect")) {
    $("#content").removeClass("x");
  }
});
