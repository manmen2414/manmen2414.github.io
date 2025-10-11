//@ts-check
import { BaseBlock } from "./base.js";
import { Routine } from "./routine.js";

//@ts-check
class Start extends BaseBlock {
  constructor() {
    super();
  }
  build() {
    return [1, 0];
  }
  toString() {
    return `[Block Start]`;
  }
}

class End extends BaseBlock {
  constructor() {
    super();
  }
  build() {
    return [2];
  }
  setTo(block) {
    throw new Error("End Block cannot have next block.");
    return block;
  }
  toString() {
    return `[Block Start]`;
  }
}

class Subroutine extends BaseBlock {
  /**@param {SubroutineSetting} setting */
  constructor(setting = {}) {
    super();
    this.routineId = setting.routine ?? Routine.ID.S1;
  }
  /**
   * @param {Routine|number} routine
   */
  setRoutine(routine) {
    if (typeof routine === "number") {
      this.routineId = routine;
    } else {
      this.routineId = routine.id;
    }
    return this;
  }
  build() {
    return [78, 0, 0];
  }
  toString() {
    return `[Block Subroutine]`;
  }
}

export { Start, End, Subroutine };
