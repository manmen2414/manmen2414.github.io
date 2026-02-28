import * as kLib from "../../koroLib/main/web.js";
import { mdpFileToMelodyBuilder } from "../koroutil.js";

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
  /**@type {number} */
  id = 0;
  /**@type {string?} */
  _name = null;
  get name() {
    return !this._name ? `${this.id}` : this._name;
  }
  set name(at) {
    this._name = at;
  }
}

let maxId = -1;

/**@type {SyncKorockle[]} */
let korockles = [];

async function addKorockle() {
  const korocklehid = await kLib.getKorockle();
  const newKorockle = new SyncKorockle(korocklehid);
  maxId++;
  newKorockle.id = maxId;
  korockles.push(newKorockle);
  onKorockleConnect(newKorockle);
}

/**
 * @param {SyncKorockle} korockle
 */
async function removeKorockle(korockle) {
  await korockle.hid.close();
  await onKorockleDisconnect(korockle);
}
/**
 * @param {SyncKorockle} korockle
 */
async function onKorockleDisconnect(korockle) {
  korockles = korockles.filter((v) => v !== korockle);
}

/**
 *
 * @param {SyncKorockle} korockle
 */
function onKorockleConnect(korockle) {
  $("#korockle-count-text").text(
    getTranslate("korockle.multi.counts")
      .replace("$", korockles.length)
      .replace("$", korockles.length === 1 ? "" : "s"),
  );
  melodySequenceWriter.addKorockle(korockle);
}

function check() {
  if (!navigator.hid) {
    setTimeout(() => {
      $("#connect-info").text(getTranslate("korockle.notworking"));
    }, 100);
  }
}

const melodySequenceWriter = {
  /**@type {(number[]|null)[][]} (melodyData:number[]|null) (korockleMelodies: melodyData[]) (korocklesMelodies: korockleMelodies[])*/
  melodies: [],
  /**@type {JQuery<HTMLDivElement>?} */
  uiWrapper: null,
  _korockleName: "korockle.multi.korocklename",
  display() {
    const table = $("#sequence-writer-table");
    table.html("");
    const header = $("<tr></tr>").append(
      $("<th></th>").text(this._korockleName),
    );

    if (!!this.melodies[0])
      this.melodies[0].forEach((_, i) => {
        header.append(`<th>${i + 1}</th>`);
      });
    header
      .append(
        $(`<th></th>`).append(
          $(`<button>+</button>`).on("click", () => this.addMelodyLine()),
        ),
      )
      .appendTo(table);

    this.melodies.forEach((korockleMelodie, koroId) => {
      const name = korockles[koroId]?.name;
      if (!name) return;
      const koroLine = $("<tr></tr>")
        .append($("<td></td>").text(name))
        .appendTo(table);

      korockleMelodie.forEach((v, meloIndex) => {
        $("<td></td>")
          .append(
            $(`<button>${!v ? "✕" : "✓"}</button>`).on("click", () =>
              this.actMelodyButton(koroId, meloIndex),
            ),
          )
          .appendTo(koroLine);
      });
    });

    $("#sequence-writer-number").attr("max", `${this.getMelodiesCount()}`);
  },
  init() {
    this._korockleName = getTranslate(this._korockleName);
    this.uiWrapper = $("#sequence-writer-ui-wrapper");
    $("#sequence-writer-ui-close").on("click", () => {
      this.uiWrapper.css("display", "none");
    });
    $("#melody-sequence-writer").on("click", () => {
      this.uiWrapper.css("display", "block");
    });
    $("#sequence-writer-all").on("click", () => {
      const colomn = parseInt($("#sequence-writer-number").val());
      if (isNaN(colomn)) return;
      this.write(colomn - 1)
        .then(() => {
          alert(getTranslate("words.done"));
        })
        .catch((ex) => {
          alert(getTranslate("words.error") + `\n${ex}`);
        });
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && this.uiWrapper.css("display") === "block")
        this.uiWrapper.css("display", "none");
    });
    this.display();
  },
  getMelodiesCount() {
    return (this.melodies[0] ?? [null]).length;
  },
  /**@param {SyncKorockle} newKorockle  */
  addKorockle(newKorockle) {
    this.melodies[newKorockle.id] = new Array(this.getMelodiesCount()).fill(
      null,
    );
    this.display();
  },
  addMelodyLine() {
    this.melodies.forEach((melodys) => melodys.push(null));
    this.display();
  },
  actMelodyButton(koroId, meloIndex) {
    if (!this.melodies[koroId]) alert(getTranslate("@words.error"));
    const koroMelodies = this.melodies[koroId];
    if (!koroMelodies[meloIndex]) {
      const input = $("#sequence-writer-melody-input")[0];
      onFileSelected(input, (text) => {
        const builder = mdpFileToMelodyBuilder(text);
        const bytes = builder.build();
        koroMelodies[meloIndex] = bytes;
        this.display();
      });
      input.click();
    } else {
      koroMelodies[meloIndex] = null;
      this.display();
    }
  },
  /**@param {number} colomn  */
  async write(colomn) {
    console.log(this.melodies);
    await Promise.all(
      korockles.map(async (k) => {
        const koroMelody = this.melodies[k.id][colomn];
        if (!koroMelody)
          throw new Error(
            getTranslate("korockle.multi.seqwriter.insufficient"),
          );
        await k.writeMelody(koroMelody);
      }),
    );
  },
};

function initMelody() {
  $("#melody-play").on("click", () => {
    korockles.forEach((k) => k.melody("once"));
  });
  $("#melody-stop").on("click", () => {
    korockles.forEach((k) => k.melody("stop"));
  });
}

function initTime() {
  $("#time-setnow").on("click", () => {
    korockles.forEach((k) => k.setTimeNow());
  });
  $("#time-setnow-wait").on("click", (ev) => {
    korockles.forEach((k) => k.setTimeNow(true));
  });
  $("#time-setthis").on("click", () => {
    let time = $("#time-time").val();
    if (time.length === 0) time = "00:00";
    /**@type {number[]} */
    const times = time.split(":").map((v) => parseInt(v));
    korockles.forEach((k) => k.setTime(...times));
  });
}

$(() => {
  initMelody();
  initTime();
  melodySequenceWriter.display();
  $("#connect").on("click", () => {
    addKorockle();
  });
  $("#disconnect").on("click", () => {
    disconnect();
  });
  if (getParam().includes("ignore-korockle-connect")) {
    $("#content").removeClass("x");
  }
  PageLoadEventTarget.addEventListener("translateEnd", () => {
    melodySequenceWriter.init();
  });
});
