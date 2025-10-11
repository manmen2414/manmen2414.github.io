//@ts-check
import { BaseBlock } from "./base.js";

class Sound extends BaseBlock {
  /**
   * @param {SoundSetting} setting
   */
  constructor(setting = {}) {
    super();
    this.sound = setting.sound ?? 1;
  }
  /**
   * @param {1|2|3|"melody_once"|"melody_loop"} sound
   */
  setSound(sound) {
    this.sound = sound;
    return this;
  }

  build() {
    /**@type {number|string} */
    let index = this.sound;
    if (index === "melody_once") index = 4;
    if (index === "melody_loop") index = 5;
    if (index === "melody_stop") index = 6;
    if (typeof index !== "number")
      throw new TypeError("sound is not vaild sound value.");
    return [35 + index, 0];
  }

  toString() {
    return `[Block Sound]`;
  }
}

export { Sound };
