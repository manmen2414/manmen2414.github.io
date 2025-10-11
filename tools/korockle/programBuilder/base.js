class BaseBlock {
  constructor() {
    /**@type {BaseBlock[]} */
    this.to = [];
  }
  /**
   * getUsedMemory()はbuild().lengthで代用可能。
   * @param {BaseBuildHelper[]} buildHelpers
   * @param {number} index
   * @returns {number[]}
   */
  build() {}
  /**
   * ブロックの次のブロックを設定します。返り値は次のブロックです。
   * @template T
   * @returns {T}
   * @param {T} block
   */
  setTo(block) {
    this.to[0] = block;
    return block;
  }
  /**
   * ブロックの次のブロックを設定します。返り値はこのブロックです。
   * @param {BaseBlock} block
   */
  setToSelf(block) {
    this.setTo(block);
    return this;
  }
  toString() {
    return `[Block Base]`;
  }
}

/**
 * @param {Variables} abcdefgh
 * @returns {number}
 */
function variableToIndex(abcdefgh) {
  return (
    { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 }[
      abcdefgh.toLowerCase()
    ] ??
    (() => {
      throw new Error(`${abcdefgh} is not variable name`);
    })()
  );
}

export { BaseBlock, variableToIndex };
