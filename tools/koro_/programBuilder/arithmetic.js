//@ts-check
import { BaseBlock, variableToIndex } from "./base.js";

class Arithmetic extends BaseBlock {
  /**
   * @param {ArithmeticOperations} op
   */
  static operationSimple(op) {
    switch (op) {
      case "=":
      case "+=":
      case "-=":
        return op;
      case "assignment":
        return "=";
      case "addition":
        return "+=";
      case "subtraction":
        return "-=";
      default:
        throw new Error(`${op} is not vaild operation.`);
    }
  }
  /**
   * @param {ArithmeticSetting} setting
   */
  constructor(setting = {}) {
    super();
    this.target = setting.target ?? "A";
    this.operation = Arithmetic.operationSimple(setting.operation ?? "=");
    this.value = setting.value ?? 0;
  }

  /**
   * @param {Variables} variable
   * @param {ArithmeticOperations} operation
   * @param {number | Variables | "temperature" | "light"} value
   */
  set(variable, operation, value) {
    this.setTarget(variable);
    this.setOperation(operation);
    this.setValue(value);
    return this;
  }

  /**
   * @param {Variables} variable
   */
  setTarget(variable) {
    this.target = variable;
    return this;
  }

  /**
   * @param {ArithmeticOperations} operation
   */
  setOperation(operation) {
    this.operation = Arithmetic.operationSimple(operation);
    return this;
  }
  /**
   * @param {number | Variables | "temperature" | "light"} value
   */
  setValue(value) {
    this.value = value;
    return this;
  }

  getFirstByte() {
    let operateIndex = 0;
    let valueIndex = 0;
    switch (this.value) {
      case "A":
      case "B":
      case "C":
      case "D":
      case "E":
      case "F":
      case "G":
      case "H":
        valueIndex = 1;
        break;
      case "temperature":
        valueIndex = 2;
        break;
      case "light":
        //こいつだけ特殊な処理
        valueIndex = -1;
        break;
    }
    switch (this.operation) {
      case "+=":
        operateIndex = 1;
        break;
      case "-=":
        operateIndex = 2;
        break;
    }
    if (valueIndex === -1) {
      return 94 + operateIndex;
    }
    return 79 + valueIndex + operateIndex * 3;
  }

  build() {
    const data = [this.getFirstByte(), 0, variableToIndex(this.target)];
    switch (this.value) {
      case "A":
      case "B":
      case "C":
      case "D":
      case "E":
      case "F":
      case "G":
      case "H":
        data.push(variableToIndex(this.value));
      default:
        if (typeof this.value === "number") data.push(this.value);
    }
    return data;
  }

  toString() {
    return `[Block Arithmetic]`;
  }
}

export { Arithmetic };
