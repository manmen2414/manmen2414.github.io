//@ts-check
import { indexOf } from "../util.js";
import { BaseBlock, variableToIndex } from "./base.js";

const solveBranch = (block, target, ignore = []) => {
  if (target.to.length === 0) target.setTo(block);
  else
    target.to.forEach((to) => {
      if (ignore.includes(to)) return;
      ignore.push(to);
      solveBranch(block, to, ignore);
    });
};

class IfBlock extends BaseBlock {
  /**
   * @param {IfCondition} condition
   * @param {IfArgments.All} setting
   */
  constructor(condition, setting) {
    super();
    this.condition = condition;
    this.setting = setting;
  }
  /**@param {IfArgments.Button} setting*/
  static Button(setting) {
    return new this("Button", setting);
  }
  /**@param {IfArgments.Light} setting*/
  static Light(setting) {
    return new this("Light", setting);
  }
  /**@param {IfArgments.Sound} setting*/
  static Sound(setting) {
    return new this("Sound", setting);
  }
  /**@param {IfArgments.Alerm} setting*/
  static Alerm(setting) {
    return new this("Alerm", setting);
  }
  /**@param {IfArgments.Timer} setting*/
  static Timer(setting) {
    return new this("Timer", setting);
  }
  /**@param {IfArgments.Time} setting*/
  static Time(setting) {
    return new this("Time", setting);
  }
  /**@param {IfArgments.Temperature} setting*/
  static Temperature(setting) {
    return new this("Temperature", setting);
  }
  /**@param {IfArgments.Random} setting*/
  static Random(setting) {
    return new this("Random", setting);
  }
  /**@param {IfArgments.Counter} setting*/
  static Counter(setting) {
    return new this("Counter", setting);
  }
  /**@param {IfArgments.Variable} setting*/
  static Variable(setting) {
    return new this("Variable", setting);
  }
  /**@param {IfArgments.Input} setting*/
  static Input(setting) {
    return new this("Input", setting);
  }
  /** @returns {s is IfArgments.Button}*/
  isConditionButton(s) {
    return this.condition === "Button";
  }
  /** @returns {s is IfArgments.Light}*/
  isConditionLight(s) {
    return this.condition === "Light";
  }
  /** @returns {s is IfArgments.Sound}*/
  isConditionSound(s) {
    return this.condition === "Sound";
  }
  /** @returns {s is IfArgments.Alerm}*/
  isConditionAlerm(s) {
    return this.condition === "Alerm";
  }
  /** @returns {s is IfArgments.Timer}*/
  isConditionTimer(s) {
    return this.condition === "Timer";
  }
  /** @returns {s is IfArgments.Time}*/
  isConditionTime(s) {
    return this.condition === "Time";
  }
  /** @returns {s is IfArgments.Temperature}*/
  isConditionTemperature(s) {
    return this.condition === "Temperature";
  }
  /** @returns {s is IfArgments.Random}*/
  isConditionRandom(s) {
    return this.condition === "Random";
  }
  /** @returns {s is IfArgments.Counter}*/
  isConditionCounter(s) {
    return this.condition === "Counter";
  }
  /** @returns {s is IfArgments.Variable}*/
  isConditionVariable(s) {
    return this.condition === "Variable";
  }
  /** @returns {s is IfArgments.Input}*/
  isConditionInput(s) {
    return this.condition === "Input";
  }

  getConditionIndex() {
    const s = this.setting;
    if (this.isConditionButton(s)) return s.activePushing ? 46 : 47;
    if (this.isConditionLight(s)) {
      const numType = typeof s.num;
      const operation = indexOf(["brighter", "same", "darker"], s.mode);
      switch (numType) {
        case "string":
          return 91 + operation;
        case "number":
          return 88 + operation;
        default:
          if (s.mode === "brighter") return 48;
          if (s.mode === "darker") return 49;
          else throw new TypeError(`${s.mode} is not vaild light operatior.`);
      }
    }
    if (this.isConditionSound(s)) return s.activeHearing ? 51 : 50;
    if (this.isConditionAlerm(s)) return s.activeOnAlerm ? 61 : 62;
    if (this.isConditionTimer(s)) return s.activeOnTimer ? 63 : 64;
    if (this.isConditionTime(s)) {
      const operation = s.compare;
      return indexOf(["earlier", "same", "later"], operation) + 58;
    }
    if (this.isConditionTemperature(s)) {
      const numType = typeof s.num;
      const operation = indexOf(["upper", "lower", "same"], s.compare);
      switch (numType) {
        case "string":
          return 56 + operation;
        case "number":
          return 55 + operation;
        default:
          throw new TypeError(`${numType} is not string or number`);
      }
    }
    if (this.isConditionCounter(s))
      return 65 + indexOf(["bigger", "same", "smaller"], s.compare);
    if (this.isConditionVariable(s)) {
      const numType = typeof s.num;
      const operation = indexOf(["bigger", "lower", "smaller"], s.compare);
      switch (numType) {
        case "string":
          return 71 + operation;
        case "number":
          return 68 + operation;
        default:
          throw new TypeError(`${numType} is not string or number`);
      }
    }
    if (this.isConditionInput(s)) return s.activeInputing ? 141 : 142;
    if (this.isConditionRandom(s)) return 75;
    throw new TypeError(`${this.condition} is not vaild if conditions.`);
  }

  build() {
    const s = this.setting;
    //最低3byte
    const data = [this.getConditionIndex(), 0, 0];
    if (this.isConditionLight(s) || this.isConditionTemperature(s)) {
      switch (typeof s.num) {
        case "string":
          data.push(variableToIndex(s.num));
          break;
        case "number":
          data.push(s.num);
          break;
      }
    }
    if (this.isConditionCounter(s)) data.push(s.num);
    if (this.isConditionTime(s)) data.push(s.time.hour, s.time.minute);
    if (this.isConditionVariable(s)) {
      data.push(variableToIndex(s.base));
      switch (typeof s.num) {
        case "string":
          data.push(variableToIndex(s.num));
          break;
        case "number":
          data.push(s.num);
          break;
      }
    }
    return data;
  }

  /**
   * であるときのブロックを設定します。返り値は引数のブロックです。
   * @template T extends BaseBlock
   * @param {T} block
   */
  setThen(block) {
    //@ts-ignore
    this.to[0] = block;
    return block;
  }

  /**
   * でないときのブロックを設定します。返り値は引数のブロックです。
   * @template T extends BaseBlock
   * @param {T} block
   */
  setElse(block) {
    //@ts-ignore
    this.to[1] = block;
    return block;
  }

  /**
   * thenとelseの先のブロックを設定します。返り値は引数のblockです。
   * thenとelseのブロックがない場合指定したブロックをその場合のブロックとします。
   * ifなどで道が分かれている場合その道全ての先を指定ブロックとします。
   * @template T
   * @param {T} block
   */
  setTo(block) {
    /*if (!!this.to[0]) solveBranch(block, this.to[0], [this]);
    else this.setThen(block);
    if (!!this.to[1]) solveBranch(block, this.to[1], [this]);
    else this.setElse(block);*/
    solveBranch(block, this);

    return block;
  }

  /**
   * thisを引数にとるラムダ式を実行します。
   * @param {(ifBlock:IfBlock)=>void} func
   *
   * ```
   * new IfBlock(...)
   *   .lambda( (i)=>i.setThen(new LED(...)) )
   *   .lambda( (i)=>i.setElse(i) )
   *   .setTo(routine.end)
   *
   * loopif: if(...){
   *   LED(...);
   *   end();
   * }else{
   *   goto loopif;
   * }
   * ```
   */
  lambda(func) {
    func(this);
    return this;
  }

  /**
   * thisを引数にとるラムダ式を実行します。
   * @param {(ifBlock:IfBlock)=>void} func
   *
   * ```
   * new IfBlock(...)
   *   .lambda( (i)=>i.setThen(new LED(...)) )
   *   .lambda( (i)=>i.setElse(i) )
   *   .setTo(routine.end)
   *
   * loopif: if(...){
   *   LED(...);
   *   end();
   * }else{
   *   goto loopif;
   * }
   * ```
   */
  L(func) {
    func(this);
    return this;
  }

  /**
   * @deprecated
   * elseを引数ブロックにし、引数ブロックの先をこのブロックにして、ループさせます。
   * 引数がnullなら、elseをこのブロックにします。
   * @param {BaseBlock|((ifBlock:IfBlock)=>BaseBlock)|null} block
   */
  setElseLoop(block = null) {
    if (typeof block === "function") block = block(this);
    if (!!block) {
      this.setElse(block);
      solveBranch(this, block);
    } else this.setElse(this);
    return this;
  }

  toString() {
    return `[Block IF]`;
  }
}

export { IfBlock };
