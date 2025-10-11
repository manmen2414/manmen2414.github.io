//@ts-check
import { Korockle } from "../korockle.js";
import { toUint8 } from "../util.js";
import { Routine } from "./routine.js";
import { Subroutine } from "./start_end_routine.js";

class KorockleProgram {
  constructor() {
    this._mainRoutine = new Routine(0);
    this._subr1 = new Routine(1);
    this._subr2 = new Routine(2);
    this._subr3 = new Routine(3);
    this._subr4 = new Routine(4);
    this.routines = [
      this._mainRoutine,
      this._subr1,
      this._subr2,
      this._subr3,
      this._subr4,
    ];
  }
  /**@param {(mainRoutine: Routine,self: KorockleProgram)=>void} func  */
  mainRoutine(func) {
    func(this._mainRoutine, this);
    return this;
  }
  /**@param {(routine: Routine,self: KorockleProgram)=>void} func  */
  subRoutine1(func) {
    func(this._subr1, this);
    return this;
  }
  /**@param {(routine: Routine,self: KorockleProgram)=>void} func  */
  subRoutine2(func) {
    func(this._subr2, this);
    return this;
  }
  /**@param {(routine: Routine,self: KorockleProgram)=>void} func  */
  subRoutine3(func) {
    func(this._subr3, this);
    return this;
  }
  /**@param {(routine: Routine,self: KorockleProgram)=>void} func  */
  subRoutine4(func) {
    func(this._subr4, this);
    return this;
  }
  /**
   *
   * @param {boolean} includeMain
   * @returns
   */
  getUsedRoutines(includeMain = true) {
    /**@type {number[]} */
    const routines = [];
    /**@param {Routine} routine */
    const checkRoutine = (routine) => {
      routine
        .getBlocks()
        .filter((v) => v instanceof Subroutine)
        .forEach((sr) => {
          if (routines.includes(sr.routineId)) return;
          routines.push(sr.routineId);
          checkRoutine(this.routines[sr.routineId]);
        });
    };
    checkRoutine(this._mainRoutine);
    if (includeMain) routines.push(this._mainRoutine.id);
    return routines;
  }
  /**
   * @param {Routine} routine
   * @param {boolean} includeSubroutine
   */
  getUsedMemoryRoutine(routine, includeSubroutine = true) {
    let routmem = routine.getUsedMemory();
    if (routine.id !== Routine.ID.MAIN) return routmem - 2;
    if (!includeSubroutine) return routmem;
    this.getUsedRoutines(false).forEach((routineNum) => {
      routmem += this.routines[routineNum].getUsedMemory() - 2;
    });
    return routmem;
  }
  getUsedMemory() {
    return this.getUsedMemoryRoutine(this._mainRoutine);
  }
  /**
   * @returns {number[]}
   */
  build() {
    /**@type {number[]} array*/
    const memory = [];
    //元プログラムでもnumと呼ばれているもの
    let num = this.getUsedMemoryRoutine(this._mainRoutine, false);
    const routineStartIndex = [0];
    const usedRoutines = this.getUsedRoutines().sort();
    for (let i = 1; i < 5; i++) {
      routineStartIndex[i] = num;
      //ルーチンが使われるなら
      if (usedRoutines.includes(i)) {
        //ルーチンインデックスiのメモリ使用量を総メモリ数に加算する
        num += this.getUsedMemoryRoutine(this.routines[i]);
      }
    }
    //元プログラムでnumを使いまわしているもの
    //let num2 = 0;
    const { bin: mainBin, connectBlocks } = this._mainRoutine.build(
      this._mainRoutine,
      routineStartIndex
    );
    //ルーチン設定処理があるがあんまり関係なさそうなんで飛ばす
    memory.push(...mainBin);
    //num2 = mainBin.length;
    usedRoutines
      .filter((v) => v !== Routine.ID.MAIN)
      .forEach((item2) => {
        const routine = this.routines[item2];
        /**使いまわしたarray3 */
        let { bin: subBin } = routine.build(routine, routineStartIndex);
        //ルーチン設定処理があるがあんまり関係なさそうなんで飛ばす
        memory.push(...subBin);
      });
    return memory.map((byte) => toUint8(byte));
  }

  /**
   * @param {Korockle} korockle
   * @returns {Promise<boolean>}
   */
  async applyToKorockle(korockle) {
    if (!korockle) return false;
    const code = this.build();
    if (code.length > 256) return false;
    await korockle.writeProgram(code);
    return true;
  }
}

export { KorockleProgram };
