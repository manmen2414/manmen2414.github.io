/**@param {number[]} gotData  */
function korockleDataToInfo(gotData) {
  const [
    _1,
    isButtonClicking,
    isLight,
    light,
    temp,
    isHearing,
    isInputing,
    _2,
    _3,
  ] = gotData;
  /**@param {number} val  */
  function bitToBool(val) {
    return !!val;
  }
  return {
    isButtonClicking: bitToBool(isButtonClicking),
    isLight: bitToBool(isLight),
    light,
    temp,
    isHearing: bitToBool(isHearing),
    isInputing: bitToBool(isInputing),
  };
}

export { korockleDataToInfo };
