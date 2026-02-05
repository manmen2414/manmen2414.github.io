//@ts-check
import { BaseBlock } from "./base.js";
import { Color } from "./color.js";
class LED extends BaseBlock {
  /**@type {Color} */
  color = Color.NONE;
  /**@type { number } */
  time = 0;
  melodySync = false;
  /**@type {"in" | "out" | "none"} */
  fade = "none";
  /**@param {LEDSetting} setting  */
  constructor(setting = {}) {
    super();
    this.color = setting.color ?? new Color(10, 10, 10);
    this.time = setting.time ?? 0;
    this.melodySync = setting.melodySync ?? this.melodySync;
    this.fade = setting.fade ?? this.fade;
  }
  /**
   * @param {number} red
   * @param {number} green
   * @param {number} blue
   */
  setColor(red, green, blue) {
    return this.setColorObj(new Color(red, green, blue));
  }
  /**
   * @param {Color} color
   */
  setColorObj(color) {
    this.color = color;
    return this;
  }
  /**
   * @param {number} time second
   * @param {"in" | "out" | "none"} fade
   */
  setTime(time = this.time, fade = this.fade) {
    this.time = time;
    this.fade = fade;
    return this;
  }
  setIsOff() {
    this.color = Color.NONE;
    return this;
  }
  build() {
    //消灯
    if (this.color.isNone()) return [35, 0];
    const colorArr = [this.color.red, this.color.green, this.color.blue];
    //連続点灯
    if (this.time <= 0) {
      const constColor = this.color.constColor();
      if (constColor !== 0) return [constColor + 3, 0];
      return [6, 0, ...colorArr];
    }
    //時間点灯
    let fadeValue = 0;
    if (this.fade !== "none") fadeValue += 1;
    if (this.fade === "out") fadeValue += 1;
    const constColor = this.color.constColor();
    if (constColor !== 0) return [constColor + fadeValue, 0, this.time * 10];
    return [3 + fadeValue, 0, this.time * 10, ...colorArr];
  }
  toString() {
    return `[Block LED (${this.color.red},${this.color.green},${this.color.blue})]`;
  }
}

export { LED };
