import getKorockle from "./get.js";
import Korockle from "./korockle.js";
import LongDataWriter from "./longdataWriter.js";
import * as util from "./util.js";
import { Color, ConstColor } from "./programBuilder/color.js";
//import LED from "./programBuilder/led.js";

const device = {
  getKorockle,
  Korockle,
  LongDataWriter,
  util,
};
const programLib = {
  Color,
  ConstColor,
  //  LED,
};
export { device, programLib };
