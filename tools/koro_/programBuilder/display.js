//@ts-check
import { BaseBlock, variableToIndex } from "./base.js";

class Display extends BaseBlock {
  /**
   * @param {DisplaySetting} setting
   */
  constructor(setting = {}) {
    super();
    this.item = setting.item ?? "None";
  }

  /**
   * @param {DisplayItems} item
   */
  setItem(item) {
    this.item = item;
    return this;
  }

  build() {
    const data = [103, 0];
    switch (this.item) {
      case "A":
      case "B":
      case "C":
      case "D":
      case "E":
      case "F":
      case "G":
      case "H":
        data[0] = 99;
        data.push(variableToIndex(this.item));
        break;
      case "Time":
        data[0] = 97;
        break;
      case "Temperature":
        data[0] = 98;
        break;
      case "Counter":
        data[0] = 100;
        break;
      case "Light":
        data[0] = 101;
        break;
      case "Waittime":
        data[0] = 102;
        break;
    }
    return data;
  }

  toString() {
    return `[Block Display]`;
  }
}

export { Display };
