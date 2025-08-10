import { Note, NOTE_SCALES, NOTE_LENGTHS } from "./note.js";
const BPMS = {
  60: 0,
  90: 1,
  120: 2,
  150: 3,
  180: 4,
};
class Melody {
  constructor(bpmIndex, isLEDLinked = false) {
    if (0 > bpmIndex || 4 < bpmIndex || bpmIndex % 1 !== 0)
      throw new RangeError(`${bpmIndex} is not vaild bpm.`);
    this.bpmIndex = bpmIndex;
    this.bpm = 60 + bpmIndex * 30;
    this.isLEDLinked = isLEDLinked;
    /**@type {Note[]} */
    this.notes = [];
  }
  /**
   * @param {Note} note
   */
  addNote(note) {
    this.notes.push(note);
  }
  /**
   * @param {number} scale
   * @param {number} length
   */
  addNoteV(scale, length) {
    this.addNote(new Note(scale, length));
  }
  getUsedLength() {
    let length = 0;
    this.notes.forEach((v) => (length += v.length));
    return length;
  }
  build() {
    const data = [];
    data.push((this.bpmIndex << 1) + (this.isLEDLinked ? 1 : 0));
    this.notes.forEach((note) => {
      data.push(note.build());
    });
    data.push(0);
    return data;
  }
}

export { BPMS, Melody, Note, NOTE_SCALES, NOTE_LENGTHS };
