//@ts-check
import { BaseBlock } from "./base.js";
import { IfBlock } from "./if.js";
import { Start, End, Subroutine } from "./start_end_routine.js";
import { Wait } from "./wait.js";
class Routine {
  /**@type {number} */
  id = 0;
  static ID = {
    MAIN: 0,
    S1: 1,
    S2: 2,
    S3: 3,
    S4: 4,
  };
  constructor(id = 0) {
    this.id = id;
    this.start = new Start();
    this.end = new End();
  }
  /**
   * 順番関係なく、start以降の全てのブロックを取得します。
   * 引数が1ならStartを含み、2ならEndを含み、3であれば両方を含みます。
   * デフォルトでは本家にあやかいすべて含みます。
   * @param {1|2|3|0} include
   */
  getBlocks(include = 0b11) {
    const includeBit = include.toString(2);
    /**@type {BaseBlock[]} */
    const blocks = [];
    /**@param {BaseBlock[]} toBlock */
    function addBlock(toBlock) {
      toBlock.forEach((b) => {
        if (blocks.includes(b)) return;
        blocks.push(b);
        addBlock(b.to);
      });
    }
    addBlock(this.start.to);
    let uniqueBlocks = [];
    if (includeBit[1] === "1") uniqueBlocks.push(this.start);
    uniqueBlocks.push(...Array.from(new Set(blocks)));
    uniqueBlocks = uniqueBlocks.filter((v) => v !== this.end);
    if (includeBit[0] === "1") uniqueBlocks.push(this.end);
    return uniqueBlocks;
  }
  getUsedMemory() {
    let memorys = this.getBlocks()
      .map((b) => b.build().length)
      .reduce((p, c) => p + c);
    return memorys;
  }
  /**
   * 本家のコード完全移植。
   * @param {Routine} routine
   * @param {number[]} routineAddresses
   * @returns {{bin:number[],connectBlocks:BaseBlock[]}}
   */
  build(routine, routineAddresses) {
    /**本家でのnum */
    let used = this.getUsedMemory();
    let blocks = this.getBlocks(0b10);
    if (routine.id === Routine.ID.MAIN) blocks = [this.start, ...blocks];
    else {
      used -= 2;
      if (this.start.to[0] !== this.end) {
        //最初に実行するブロックを消し最初に実行するブロックを追加する(??????????????????????????????)
        //本家にもそういう挙動があったので意味があるかは不明だけど追加しておく
        blocks = blocks.filter((v) => v !== this.start.to[0]);
        blocks = [this.start.to[0], ...blocks];
      }
    }
    //本家にもそういう挙動があったので意味があるかは不明だけど追加しておく
    blocks = blocks.filter((v) => v !== this.end);
    blocks.push(this.end);
    /**
     * 本家でのarray
     * @type {number[]}
     */
    let bin = [];
    /**
     * 本家でのarray2
     * @type {number[]}
     */
    let offsetedBin = [];
    /** 本家でのnum2*/
    let offset = 0;
    blocks.forEach((b) => {
      offsetedBin.push(offset + routineAddresses[routine.id]);
      /**本家でのarray4 */
      const blockBin = b.build();
      blockBin.forEach((byte, j) => {
        bin[offset + j] = byte;
      });
      offset += blockBin.length;
    });
    blocks.forEach((block, i) => {
      if (block instanceof End) return;
      bin[offsetedBin[i] - routineAddresses[routine.id] + 1] =
        offsetedBin[blocks.indexOf(block.to[0])];
      /*if (block instanceof BlockWaitCondition) { //BlockWaitConditionってなんやねん
        bin[offsetedBin[i] - routineAddresses[routine.id] + 2] =
          offsetedBin[i] - routineAddresses[routine.id];
      } else */ if (block instanceof IfBlock) {
        bin[offsetedBin[i] - routineAddresses[routine.id] + 2] =
          offsetedBin[blocks.indexOf(block.to[1])];
      } else if (block instanceof Subroutine) {
        bin[offsetedBin[i] - routineAddresses[routine.id] + 2] =
          routineAddresses[block.routineId];
      }
    });
    bin = bin.slice(0, used);
    return {
      bin,
      connectBlocks: blocks,
    };
  }
}

export { Routine };
