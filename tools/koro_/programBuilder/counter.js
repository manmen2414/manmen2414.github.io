//@ts-check
import { BaseBlock } from "./base.js";

class Counter extends BaseBlock {
  /**
   * @param {CounterSetting} setting
   */
  constructor(setting = {}) {
    super();
    this.action = setting.action ?? "start";
  }

  /**
   * @param {"start" | "stop" | "reset"} action
   */
  setAction(action) {
    this.action = action;
    return this;
  }

  build() {
    let data = 43;
    if (this.action === "stop") data = 44;
    if (this.action === "reset") data = 45;
    return [data, 0];
  }

  toString() {
    return `[Block Counter]`;
  }
}

export { Counter };
