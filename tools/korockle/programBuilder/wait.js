//@ts-check
import { BaseBlock } from "./base.js";

class Wait extends BaseBlock {
  /**
   * @param {WaitSetting} setting
   */
  constructor(setting = {}) {
    super();
    this.time = setting.time ?? 0.1;
  }

  /**
   * @param {number} second
   */
  setTime(second) {
    this.time = second;
    return this;
  }

  build() {
    return [42, 0, this.time * 10];
  }

  toString() {
    return `[Block Wait]`;
  }
}

export { Wait };
