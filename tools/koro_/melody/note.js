const NOTE_SCALES = {
  REST: 1,
  LOW_FA_SHARP: 2,
  LOW_SO: 3,
  LOW_SO_SHARP: 4,
  LOW_RA: 5,
  LOW_RA_SHARP: 6,
  LOW_SI: 7,
  DO: 8,
  DO_SHARP: 9,
  RE: 10,
  RE_SHARP: 11,
  MI: 12,
  FA: 13,
  FA_SHARP: 14,
  SO: 15,
  SO_SHARP: 16,
  RA: 17,
  RA_SHARP: 18,
  SI: 19,
  HIGH_DO: 20,
  HIGH_DO_SHARP: 21,
  HIGH_RE: 22,
  HIGH_RE_SHARP: 23,
  HIGH_MI: 24,
  HIGH_FA: 25,
  HIGH_FA_SHARP: 26,
  HIGH_SO: 27,
  HIGH_SO_SHARP: 28,
  HIGH_RA: 29,
  HIGH_RA_SHARP: 30,
  HIGH_SI: 31,
};
const NOTE_LENGTHS = {
  SIXTEEN: 0,
  EIGHT: 1,
  EIGHT_DOT: 2,
  FOUR: 3,
  FOUR_DOT: 4,
  TWO: 5,
  TWO_DOT: 6,
  ONE: 7,
};
class Note {
  /**
   * @param {number} scale
   * @param {number} length
   */
  constructor(scale, length) {
    if (1 > scale || 31 < scale || scale % 1 !== 0)
      throw new RangeError(`${scale} is not vaild note scale.`);
    if (0 > length || 7 < length || length % 1 !== 0)
      throw new RangeError(`${length} is not vaild note length.`);
    this.scale = scale;
    this.length = length;
  }
  build() {
    return (this.scale << 3) + this.length;
  }
}

export { Note, NOTE_SCALES, NOTE_LENGTHS };
