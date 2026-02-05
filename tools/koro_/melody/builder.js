import * as melody from "./melody.js";

class MelodyBuilder extends melody.Melody {
  constructor(bpmIndex = 0, isLEDLinked = false) {
    super(bpmIndex, isLEDLinked);
  }
  /**
   * @param {number} bpm
   */
  setBPM(bpm) {
    if (0 <= bpm && 4 >= bpm && bpm % 1 === 0) {
      this.bpmIndex = bpm;
    } else {
      if (bpm > 180) bpm = 180;
      if (bpm < 60) bpm = 60;
      this.bpmIndex = Math.round((bpm - 60) / 30);
    }
    this.bpm = 60 + this.bpmIndex * 30;
    return this;
  }
  /**
   * @param {boolean} link
   */
  setLEDLink(link) {
    this.isLEDLinked = link;
  }
  /**
   * @param {number} scale
   * @param {number} length
   */
  N(scale, length) {
    this.addNoteV(scale, length);
    return this;
  }
}
export { MelodyBuilder };
