import * as kLib from "../koroLib/main/web.js";
const { Color } = kLib;

/**
 * @type {kLib.Korockle}
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
      $("#connect-info").text(getTranslate("korockle.notworking"));
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
    korockle.melody("once", isNaN(val) ? 0 : val);
  });
  $("#melody-loop").on("click", () => {
    korockle.melody("loop");
  });
  $("#melody-stop").on("click", () => {
    korockle.melody("stop");
  });
  $("#melody-midi-write").on("click", () => {
    const file = $("#melody-midi")[0].files[0];
    let track = $("#melody-midi-track").val();
    if (track.length === 0) track = 0;
    else track = parseInt(track) - 1;
    if (!file) {
      alert(getTranslate("korockle.sound.midi.pleaseselect"));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = /data:audio\/mid;base64,([a-zA-Z0-9\/\+=]+)/.exec(
        reader.result,
      );
      if (!b64) {
        alert(getTranslate("words.error") + "\nBase64 Error");
        return;
      }
      const melody = await kLib.parseMidi(b64[1], track, "null");
      if (!melody) {
        alert(getTranslate("words.error") + "\nWriting Error");
        return;
      }
      await korockle.writeMelody(melody.build());
      alert(getTranslate("words.done"));
    };
    reader.readAsDataURL(file);
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
function initCommand() {
  const select = $("#commandid-selector");
  const data = $("#command-data");
  const idInput = $("#commandid");
  const answer = $("#command-answer");
  select.on("change", () => {
    idInput.val(select.val());
    select.val("0");
  });
  $("#command-send").on("click", () => {
    if (!korockle) return;
    const intOr0 = (val) => (val.length === 0 ? 0 : parseInt(val));
    const id = Math.abs(intOr0(idInput.val())) % 256;
    idInput.val(id);
    /**@type {number[]} */
    const datas = data
      .val()
      .split(/[^0-9]+/)
      .map((v) => Math.abs(parseInt(v) % 256));
    if (datas.length >= 64) {
      korockle.sendCommand(id);
      const ldw = new kLib.LongDataWriter(korockle, data);
      answer.text(getTranslate("korockle.command.sendedlong"));
    } else {
      korockle.sendCommand(id, datas).then((a) => {
        answer.text(a.join());
      });
    }
  });
}

function initReadWrite() {
  const melodyCheck = $("#rw-melody")[0];
  const result = $("#rw-result");
  function writeResult(str) {
    result.text(str);
    setTimeout(() => result.html(""), 3000);
  }
  function onerror() {
    writeResult(getTranslate("words.error"));
  }
  /**
   * @param {string} str
   */
  async function writeStr(str) {
    if (!korockle) return;
    let data = str.split(/[^0-9]+/).map((v) => parseInt(v));
    if (data.length < 256) data.push(...new Array(256).fill(0));
    if (data.length > 256) data = data.slice(0, 256);

    if (melodyCheck.checked) await korockle.writeMelody(data);
    else await korockle.writeProgram(data).catch(onerror);
    writeResult(getTranslate("korockle.wrote"));
  }
  async function read() {
    if (!korockle) return;
    let bytes = [0];
    if (melodyCheck.checked) bytes = await korockle.readMelody().catch(onerror);
    else bytes = await korockle.readProgram().catch(onerror);
    if (!bytes) return void onerror();
    return bytes;
  }
  $("#rw-saveclip").on("click", async () => {
    const data = await read();
    if (!data) return;
    navigator.clipboard.writeText(data.join());
    writeResult(getTranslate("words.copied"));
  });
  $("#rw-savetxt").on("click", async () => {
    const data = await read();
    if (!data) return;
    downloadText(data.join(), "korockle-program.txt");
  });
  $("#rw-savedat").on("click", async () => {
    const data = await read();
    if (!data) return;
    downloadUrl(
      `data:application/octet-stream;base64,${bytesToBase64(data)}`,
      "korockle-program.dat",
    );
  });
  $("#rw-writeclip").on("click", async () => {
    const data = await navigator.clipboard.readText().catch(onerror);
    console.log(data);
    if (!data) return onerror();
    await writeStr(data);
  });
  const inputFile = $("#rw-fileselector")[0];
  $("#rw-writefile").on("click", () => {
    inputFile.click();
  });
  onFileSelected(inputFile, async (text) => {
    let numbersLength = text.split(/[^0-9]/).join("").length;
    let noNumbersLength = text.split(/[0-9]/).join("").length;
    if (numbersLength < noNumbersLength) {
      // バイナリファイルであると判定
      console.log(text);
      text = stringToByte(text).join();
      console.log(text);
    }
    await writeStr(text);
  });
}

function initFileConverting() {
  $("#file-conv-btn").on("click", () => {
    $("#file-conv-inp")[0].click();
  });
  onFileSelected($("#file-conv-inp")[0], (text, name) => {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const isWin = !!xml.querySelector("X");
      const isWeb = !!xml.querySelector("x");
      if (!isWin && !isWeb) {
        alert(getTranslate("@korockle.file.nokorockle"));
        return;
      }
      if (isWin && isWeb) {
        alert(getTranslate("@korockle.file.globaled"));
        return;
      }
      const posX = xml.querySelectorAll(isWin ? "X" : "x");
      const posY = xml.querySelectorAll(isWin ? "Y" : "y");
      posX.forEach((v) => {
        const newX = xml.createElement(isWin ? "x" : "X");
        newX.innerHTML = v.innerHTML;
        v.insertAdjacentElement("afterend", newX);
      });
      posY.forEach((v) => {
        const newY = xml.createElement(isWin ? "y" : "Y");
        newY.innerHTML = v.innerHTML;
        v.insertAdjacentElement("afterend", newY);
      });
      const serialzer = new XMLSerializer();
      downloadText(serialzer.serializeToString(xml), name);
    } catch (ex) {
      alert(ex);
    }
  });
}

function initKorocklePlayer() {
  const wait = (sec) => new Promise((r) => setTimeout(r, sec * 1000));
  function call(addFreq, sec) {
    const audioCtx = new AudioContext();
    const mainGain = audioCtx.createGain();
    mainGain.gain.value = 0.15;
    mainGain.connect(audioCtx.destination);
    const subGain = audioCtx.createGain();
    subGain.gain.value = 0.05;
    subGain.connect(audioCtx.destination);

    const mainFreq = [1049, 2090, 3147, 5283];

    mainFreq.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        freq + addFreq * (i + 1),
        audioCtx.currentTime,
      );

      if (i < 2) osc.connect(mainGain);
      else osc.connect(subGain);
      osc.start();
      osc.stop(sec - 0.01);
    });
    return wait(sec);
  }
  const callList = {
    LOW_FA_SHARP: -306,
    LOW_SO: -262.009,
    LOW_SO_SHARP: -215.4,
    LOW_RA: -166,
    LOW_RA_SHARP: -113.7,
    LOW_SI: -58.2,
    DO: 0,
    DO_SHARP: 62.7,
    RE: 128.6,
    RE_SHARP: 198.5,
    MI: 272.51,
    FA: 350.913,
    FA_SHARP: 434,
    SO: 521.982,
    SO_SHARP: 615.219,
    RA: 714,
    RA_SHARP: 818.655,
    SI: 929.5,
    HIGH_DO: 1044,
    HIGH_DO_SHARP: 1171.5,
    HIGH_RE: 1303.3,
    HIGH_RE_SHARP: 1443.016,
    HIGH_MI: 1591.02,
    HIGH_FA: 1747.826,
    HIGH_FA_SHARP: 1913.955,
    HIGH_SO: 2089.963,
    HIGH_SO_SHARP: 2276.438,
    HIGH_RA: 2474,
    HIGH_RA_SHARP: 2683.31,
    HIGH_SI: 2905.066,
  };
  $("#file-player-btn").on("click", () => {
    $("#file-player-inp")[0].click();
  });
  let stopPlay = () => {};
  const info = $("#file-player-info");
  onFileSelected($("#file-player-inp")[0], (text, name) => {
    stopPlay();
    info.text(`${name} Loading...`);
    const TEMPOS = [60, 90, 120, 150, 180];
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    if (!xml.querySelector("MelodyModule")) {
      alert(getTranslate("@korockle.file.nokorockle"));
      info.text(``);
      return;
    }
    const tempo = TEMPOS[parseInt(xml.querySelector("tempoIndex").innerHTML)];
    const beatsecond = 60 / tempo;
    const times = {
      SIXTEEN: beatsecond / 4,
      EIGHT: beatsecond / 2,
      EIGHT_DOT: beatsecond / 1.5,
      FOUR: beatsecond,
      FOUR_DOT: beatsecond * 1.5,
      TWO: beatsecond * 2,
      TWO_DOT: beatsecond * 3,
      ONE: beatsecond * 4,
    };
    const keys = xml.querySelectorAll("Key");
    const iterator = keys.entries();
    let playing = true;
    stopPlay = () => {
      playing = false;
    };
    info.text(`${name} 0/${keys.length} | BPM: ${tempo}`);
    (async () => {
      for (const [i, el] of iterator) {
        if (!playing) return;
        info.text(`${name} ${i + 1}/${keys.length} | BPM: ${tempo}`);
        const rank = el.querySelector("Rank").innerHTML;
        const leng = el.querySelector("Length").innerHTML;
        const add = callList[rank];
        const time = times[leng];
        if (add === undefined) await wait(time);
        else await call(add, time);
      }
    })();
  });
}

const noteLengthNumbered = [
  1, //16分
  2, //8分
  3, //8.分
  4, //4分
  6, //4.分
  8, //2分
  12, //2.分
  16, //1分
];

function initMelodySlicer() {
  const melodySlicerBtn = $("#melody-slicer-btn");
  const closeBtn = $("#melody-slicer-ui-close");
  const uiWrapper = $("#melody-slicer-ui-wrapper");
  const table = $("#melody-slicer-table");
  const input = $("#melody-slicer-melody-input")[0];
  const memoryLimitInput = $("#melody-slicer-max-memory");
  /**@type {(kLib.Melody?)[][]} */
  const melodiess = [[null]];
  melodySlicerBtn.on("click", () => {
    display();
    uiWrapper.css("display", "block");
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && uiWrapper.css("display") === "block")
      uiWrapper.css("display", "none");
  });
  closeBtn.on("click", () => {
    uiWrapper.css("display", "none");
  });
  $("#melody-slicer-generate").on("click", async () => {
    const generating = $("#melody-slicer-generating");
    generating.text(getTranslate("words.generating"));
    await waitNextFrame();
    const zip = generateZip();
    zip
      .generateAsync({ type: "blob" })
      .then(async (b) => {
        generating.text(getTranslate("words.done"));
        await waitNextFrame();
        downloadUrl(URL.createObjectURL(b), "melodies.zip");
      })
      .catch((ex) => {
        generating.text(getTranslate("words.error") + `\n${ex}`);
      });
  });
  function display() {
    table.html("");
    const header = $("<tr></tr>")
      .append($("<th></th>").text(""))
      .appendTo(table);

    if (!!melodiess[0])
      melodiess[0].forEach((_, i) => {
        header.append(`<th>${i + 1}</th>`);
      });

    melodiess.forEach((partMelodies, partI) => {
      const koroLine = $("<tr></tr>")
        .append($("<td></td>").text(`Part${partI + 1}`))
        .appendTo(table);

      partMelodies.forEach((melody, melodyIndex) => {
        $("<td></td>")
          .append(
            $(`<button>${!melody ? "✕" : "✓"}</button>`).on("click", () =>
              actMelodyButton(partI, melodyIndex),
            ),
          )
          .appendTo(koroLine);
      });
    });

    $("<tr></tr>")
      .append(
        $("<th></th>").append(
          $(`<button>+</button>`).on("click", () => addPart()),
        ),
      )
      .appendTo(table);
  }

  /**
   * @param {number} partI
   * @param {number} melodyI
   */
  function actMelodyButton(partI, melodyI) {
    const melody = melodiess[partI][melodyI];
    console.log(melody);
    if (!melody) {
      onFileSelected(input, async (text) => {
        const newMelody = await kLib.MDP.readMDP(text);
        const firstMelody = melodiess[partI][0];
        if (!!firstMelody && firstMelody.bpmIndex !== newMelody.bpmIndex) {
          alert(getTranslate("korockle.melody-slicer.bpm-incorrect"));
          return;
        }
        melodiess[partI][melodyI] = newMelody;
        if (melodiess[partI].length === melodyI + 1) {
          addMelodyForParts();
        }
        display();
      });
      input.click();
    } else {
      melodiess[partI][melodyI] = null;
      display();
    }
  }
  function addPart() {
    const leng = melodiess[0].length;
    melodiess.push(new Array(leng).fill(null));
    display();
  }
  function addMelodyForParts() {
    melodiess.forEach((p) => p.push(null));
    display();
  }
  function generate() {
    /**@type {kLib.Melody[]} */
    const parts = [];
    /**@type {number[][]} */
    const noteEndTimingss = [];
    // メロディを結合し、ノーツごとの終了タイミングをまとめる
    for (const melodysIncludeNull of melodiess) {
      const melodies = melodysIncludeNull.filter((m) => !!m);
      const firstMelody = melodies[0];
      if (!firstMelody) break;
      const baseMelody = new kLib.Melody(
        firstMelody.bpmIndex,
        firstMelody.isLEDLinked,
      );
      /**@type {number[]} */
      const noteEndTimings = [];
      let nowTiming = 0;
      for (const melody of melodies) {
        for (const note of melody.notes) {
          baseMelody.addNote(note);
          nowTiming += noteLengthNumbered[note.length];
          noteEndTimings.push(nowTiming);
        }
      }
      parts.push(baseMelody);
      noteEndTimingss.push(noteEndTimings);
    }

    // 共通しているノーツ終了タイミングを探し出す
    const sharedTimings = noteEndTimingss.reduce((p, c) =>
      p.filter((v) => c.includes(v)),
    );

    let memoryLimit = parseInt(memoryLimitInput.val());
    if (isNaN(memoryLimit)) memoryLimit = 254;

    /**@type {number[]} */
    const splitTimings = [];
    let nowEndTiming = 0;
    let startTiming = 0;
    // コロックルに書き込める最大のメモリサイズで区切れるタイミングを探す
    for (const timing of sharedTimings) {
      if (nowEndTiming > timing) continue;
      for (const noteEndTimings of noteEndTimingss) {
        // コロックルのメモリサイズはノーツ数+1で計算可能
        let useMemorys = 1;
        noteEndTimings.forEach((n) => {
          if (startTiming < n && n <= timing) useMemorys++;
        });
        if (useMemorys > memoryLimit) {
          // nowEndTimingがメモリ内に収まる最大の区切り位置
          splitTimings.push(nowEndTiming);
          startTiming = nowEndTiming + 1;
        }
        nowEndTiming = timing;
      }
    }
    // 一番後ろをとれるように追加
    splitTimings.push(Infinity);
    /**@type {kLib.Melody[][]} */
    const resultMelodiess = [];
    // 区切る
    parts.forEach((part, partI) => {
      let lastTiming = 0;
      const noteEndTimings = noteEndTimingss[partI];
      /**@type {kLib.Melody[]} */
      const melodies = [];
      for (const timing of splitTimings) {
        const melody = new kLib.Melody(part.bpmIndex);
        melody.notes = part.notes.filter((_, ni) => {
          const endTiming = noteEndTimings[ni];
          return lastTiming < endTiming && endTiming <= timing;
        });
        melodies.push(melody);
        lastTiming = timing;
      }
      resultMelodiess.push(melodies);
    });
    return resultMelodiess;
  }
  function generateZip() {
    const result = generate();
    console.log(result);
    // return;
    /**@type {ReturnType<typeof import("jszip")>} */
    const zip = new JSZip();
    result.forEach((melodys, parti) => {
      const folder = zip.folder(`Part${parti + 1}`);
      if (!folder) throw new Error(`Can't create folder "Part${parti + 1}"`);
      melodys.forEach((melody, melodyi) => {
        const mdp = kLib.MDP.melodyToV4_3MDP(melody, {
          comment:
            `Part: ${parti + 1}, Index: ${melodyi + 1}\n` +
            `Sliced with Melody Slicer by Mameeenn https://manmen2414.github.io/tools/korockle`,
        });
        folder.file(`${melodyi + 1}.mdp`, mdp);
      });
    });
    return zip;
  }
}

$(() => {
  check();
  //initInputing();
  initSounds();
  initLEDs();
  initTimeAlerm();
  initCommand();
  initReadWrite();
  initFileConverting();
  initKorocklePlayer();
  initMelodySlicer();
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
