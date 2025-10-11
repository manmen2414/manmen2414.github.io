import { NOTE_LENGTHS, NOTE_SCALES } from "./melody.js";
import { MelodyBuilder } from "./builder.js";
//HACK: このクソみたいなコードのリファクタリング
class MidiMelodyBuilder extends MelodyBuilder {
  constructor(data, track) {
    super(0, false);
    /**@type {{  "deltaTime": number,  "type": number,  "metaType": number,  "data": number|number[]}[]}  */
    this.track = data.track[track ?? 0].event;
    this.data = data;
    this.jsonData = data;
    this.debug = false;
    this.getBPM();
    this.getDeltatime();
    this.mapNotes();
  }
  getBPM() {
    let bpmEvent = { data: 500000 }; //500000 = BPM120(デフォルト)
    this.data.track
      .map((v) => v.event)
      .forEach((ev) => {
        //全トラックから探し出す
        bpmEvent =
          ev.find((v) => v.type === 0xff && v.metaType === 81) ?? bpmEvent;
      });
    const bps = 1000000 / bpmEvent.data;
    this.setBPM(Math.round(bps * 60));
  }
  getDeltatime() {
    //TODO:なんか違う形式の構文があるらしい
    this.deltaTime = this.data.timeDivision;
  }
  _log(text) {
    if (this.debug) console.log(`MidiParser: ${text}`);
  }
  mapNotes() {
    if (this.debug) console.log(this.track);
    /**@type {{  "deltaTime": number,"elapseTime":number, "type": number,  "metaType": number,  "data": number|number[]}[]} なっている音 */
    let soundingNote = [];
    this.track.forEach((note, i, ev) => {
      //各イベントに相対時間があるため、ノーツ発火タイミングからの絶対時間にする
      soundingNote.forEach((v) => (v.elapseTime += note.deltaTime));
      if (note.type !== 8 && note.type !== 9) return;
      if (!note.data || typeof note.data !== "object") return;
      /**@type {number} */
      const rawNoteLevel = note.data[0];
      //このノーツが停止合図の場合、対応する開始ノーツ
      const sounding =
        note.data[1] === 0
          ? soundingNote.find((v) => v.data[0] === rawNoteLevel)
          : null;
      //保持ノーツなしかつ相対時間がある場合は休みを追加
      if (soundingNote.length === 0 && note.deltaTime !== 0) {
        this._log(`[${i}]休み 開始: 0`);
        this.addNoteV(
          NOTE_SCALES.REST,
          this.transDeltaTimeToKorockleTime(note.deltaTime)
        );
        this._log(`[${i}]休み 終了: ${note.deltaTime}`);
      }
      //ノーツが開始合図
      if (!sounding) {
        this._log(`[${i}]${rawNoteLevel} 開始: 0`);
        soundingNote.push({ ...note, elapseTime: 0 });
      }
      //ノーツが停止合図
      if (!!sounding) {
        this._log(`[${i}]${rawNoteLevel} 終了: ${sounding.elapseTime}`);
        let noteLevel = rawNoteLevel - 60 + 8;
        //音が高すぎる/低すぎる場合はマッピング
        while (noteLevel > NOTE_SCALES.HIGH_SI) {
          noteLevel -= NOTE_SCALES.HIGH_SI - NOTE_SCALES.LOW_SI;
        }
        while (noteLevel < NOTE_SCALES.LOW_FA_SHARP) {
          noteLevel += NOTE_SCALES.HIGH_FA_SHARP - NOTE_SCALES.LOW_FA_SHARP;
        }
        this.addNoteV(
          noteLevel,
          this.transDeltaTimeToKorockleTime(sounding.elapseTime)
        );
        soundingNote = soundingNote.filter((v) => v !== sounding);
      }
    });
  }
  /**@param {number} delta  */
  transDeltaTimeToKorockleTime(delta) {
    const t4 = delta / this.deltaTime;
    if (t4 < (1 / 4 + 1 / 2) / 2) return NOTE_LENGTHS.SIXTEEN;
    if (t4 < (1 / 2 + 1 / 1.5) / 2) return NOTE_LENGTHS.EIGHT;
    if (t4 < (1 / 1.5 + 1) / 2) return NOTE_LENGTHS.EIGHT_DOT;
    if (t4 < (1 + 1.5) / 2) return NOTE_LENGTHS.FOUR;
    if (t4 < (1.5 + 2) / 2) return NOTE_LENGTHS.FOUR_DOT;
    if (t4 < (2 + 3) / 2) return NOTE_LENGTHS.TWO;
    if (t4 < (3 + 4) / 2) return NOTE_LENGTHS.TWO_DOT;
    return NOTE_LENGTHS.ONE;
  }
}
/**
 *
 * @param {string} filebase64
 * @param {number} track
 * @param {"throw"|"melody"|"null"} ifNoPackage
 * @returns {Promise<MidiMelodyBuilder|null}
 */
function parseMidi(filebase64, track = 0, ifNoPackage = "throw") {
  return new Promise((r, j) => {
    function libgot(lib) {
      const data = lib.parse(filebase64);
      r(new MidiMelodyBuilder(data, track));
    }
    function nogot() {
      switch (ifNoPackage) {
        case "melody":
          r(new MelodyBuilder(120, false));
        case "null":
          r(null);
        default:
          j(new Error('Module "midi-parser-js" not installed'));
      }
    }
    import("midi-parser-js").then(
      (v) => libgot(v.default),
      (c) => {
        if (typeof window === "object" && !!window.MidiParser) {
          libgot(window.MidiParser);
        } else nogot();
      }
    );
  });
}

export { parseMidi, MidiMelodyBuilder };
