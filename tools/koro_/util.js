//@ts-check
function isHidUseable() {
  //@ts-ignore navigator.hidなんてあるよ うるせぇよ 黙れよ navigator.hidなんてあるよ node.js:85こそが正義 navigator.hidなんて あるよ 正しいのは俺
  return !!navigator.hid;
}
/**
 * @param {number} value
 * @returns {boolean}
 */
function checkUint8(value) {
  if (value % 1 !== 0) return false;
  return 0 <= value && value < 256;
}
/**
 * @param {number} value
 */
function toUint8(value) {
  while (value < 0) {
    value = 256 + value;
  }
  const testvalue = Math.floor(value) % 256;
  if (!checkUint8(testvalue)) return 0;
  return testvalue;
}
/**
 *
 * @param {any} object
 * @param {string} key
 */
function findIndex(object, key) {
  return Object.entries(object).find((kv) => kv[0] === key)?.[1];
}
/**
 *
 * @param {DataView} dataView
 * @returns {number[]}
 */
function dataViewToArray(dataView) {
  /**@type {number[]} */
  const data = [];
  function getData(index = 0) {
    data.push(dataView.getUint8(index));
    getData(index + 1);
    return data;
  }
  try {
    return getData();
  } catch (ex) {
    return data;
  }
}
/**
 * @param {number} value
 * @returns {number[]}
 */
function convertToDeviceEndian(value) {
  const isLittleEndian = !!new Uint8Array(Uint16Array.of(1).buffer)[0];
  if (isLittleEndian) return [value, 0];
  const buffer = new ArrayBuffer(2);
  new Uint16Array(buffer, 0, 1)[0] = value;
  return Array.from(new Uint8Array(buffer, 0, 2).reverse());
}

/**
 * @template T
 * @param {T[]} array
 * @param {T} item
 * @param {boolean} isnotExistThrow
 * @returns {number}
 */
function indexOf(array, item, isnotExistThrow = true) {
  const n = array.indexOf(item);
  if (isnotExistThrow && n === -1)
    throw new Error(`${item} isn't exist in ${array.join(",")}`);
  return n;
}

export {
  checkUint8,
  toUint8,
  findIndex,
  isHidUseable,
  dataViewToArray,
  convertToDeviceEndian,
  indexOf,
};
