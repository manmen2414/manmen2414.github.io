//@ts-check
import getKorockle from "./get.js";
import * as util from "./util.js";
import { toUint8 } from "./util.js";
import LongDataWriter from "./longdataWriter.js";
import CommandId from "./commandId.js";
import korockleDataToInfo from "./dataToInfo.js";
import { Color } from "./programBuilder/color.js";
const THREE0 = [0, 0, 0];
class Korockle {
  /**@type {HIDDevice | null} */
  hid = null;
  /**@type {number[] } */
  __data = [];
  /**@type {number} */
  commandSequenceNumber = 0;
  /**@type {number} */
  __dataRemoveId = 0;
  /**@param {HIDDevice | null} hid  */
  constructor(hid = null) {
    if (!hid) {
      getKorockle().then((hid) => {
        this.hid = hid;
      });
      return this;
    }
    this.hid = hid;
    this.hid.addEventListener("inputreport", (event) => {
      //@ts-ignore
      this.__inputreport(event);
    });
  }
  async execute() {
    await this.sendCommand(CommandId.executeProgram);
  }
  /** `execute`と同じ */
  async runProgram() {
    await this.execute();
  }
  async stopProgram() {
    await this.sendCommand(CommandId.stopProgram);
  }
  /**@param {number[]} program */
  async writeProgram(program) {
    await this.sendCommand(CommandId.writeProgram);
    const longData = new LongDataWriter(this, program);
    return await longData.send();
  }
  /**
   * @param {number} reportId
   * @param {number} commandId
   * @param {number[]} data
   * @param {0 | 1} webAudio
   */
  sendData(reportId, commandId, data = [], webAudio = 0) {
    //TODO: パケット分割
    if (!this.hid) throw new Error("HID not readied");
    if (data.length >= 64) {
      throw new RangeError(`Data over. length:${data.length}`);
    }
    return this.hid.sendReport(
      webAudio,
      Uint8Array.from([reportId, commandId, ...data])
    );
  }
  /**
   * @param {number} commandId
   * @param {number[]} data
   */
  async sendCommand(commandId, data = []) {
    this.commandSequenceNumber = toUint8(this.commandSequenceNumber + 1);
    await this.sendData(commandId, this.commandSequenceNumber, data);
    const read = await this.readData();
    return read;
  }
  async getInfoRaw() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(CommandId.getInfo, []);
    if (!data) return null;
    return data.slice(2);
  }
  async getInfo() {
    const data = await this.getInfoRaw();
    if (!data) return null;
    return korockleDataToInfo(data);
  }
  /**
   * @param {Color} color
   */
  async led(color = new Color(0, 0, 0)) {
    if (color.red === 0 && color.blue === 0 && color.green === 0) {
      await this.sendCommand(CommandId.action, [35, 0, 0, 0, 0]);
    } else {
      const constColor = color.constColor();
      const argment = [6, 0, color.red, color.green, color.blue];
      if (constColor !== 0) argment[0] = constColor + 3;
      await this.sendCommand(CommandId.action, argment);
    }
  }
  /**
   * @param {1|2|3} id
   */
  async sound(id) {
    await this.sendCommand(CommandId.action, [35 + id, 0]);
  }
  /**
   * @param {"once" | "loop" | "stop"} type
   * @param {number} index
   */
  async melody(type, index = 0) {
    switch (type) {
      case "once":
        await this.sendCommand(CommandId.playMelody, [index + 1]);
        break;
      case "loop":
        await this.sendCommand(CommandId.action, [40, 0]);
        break;
      case "stop":
        await this.sendCommand(CommandId.stopMeloay);
        break;
    }
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  async setTime(hour_date, _minute = -1) {
    /**@type {number} */
    let hour;
    /**@type {number} */
    let minute;
    if (typeof hour_date !== "number") {
      hour = hour_date.getHours();
      minute = hour_date.getMinutes();
    } else {
      hour = hour_date;
      minute = _minute;
    }
    await this.sendCommand(CommandId.setTimeOrAlerm, [
      1,
      minute,
      hour,
      ...THREE0,
    ]);
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  async setAlerm(hour_date, _minute = -1) {
    /**@type {number} */
    let hour;
    /**@type {number} */
    let minute;
    if (typeof hour_date !== "number") {
      hour = hour_date.getHours();
      minute = hour_date.getMinutes();
    } else {
      hour = hour_date;
      minute = _minute;
    }
    await this.sendCommand(CommandId.setTimeOrAlerm, [
      ...THREE0,
      1,
      minute,
      hour,
    ]);
  }
  /**
   * @param reservation 予約モード: 時刻の秒が0秒になるまで待機し、なったら書き込む
   */
  async setTimeNow(reservation = false) {
    if (reservation) {
      //予約モード: 0秒になったら書き込む
      const id = setInterval(() => {
        const date = new Date();
        if (date.getSeconds() === 0) {
          this.setTime(date);
          clearInterval(id);
        }
      }, 100);
    } else {
      await this.setTime(new Date());
    }
  }
  /**@param {HIDInputReportEvent} event  */
  __inputreport(event) {
    if (!this.hid) return;
    if (event.device.productId !== this.hid.productId) return;
    if (event.device.vendorId !== this.hid.vendorId) return;

    this.__data = util.dataViewToArray(event.data);
    this.__dataRemoveId = setTimeout(() => {
      this.__data = [];
    }, 500);
  }
  /**
   * @returns {Promise<number[]>}
   */
  readData() {
    return new Promise((r, j) => {
      let count = 0;
      const id = setInterval(() => {
        if (this.__data.length !== 0) {
          const data = [...this.__data];
          this.__data.length = 0;
          clearTimeout(this.__dataRemoveId);
          r(data);
          clearInterval(id);
          return;
        }
        count++;
        if (count > 300) {
          clearInterval(id);
          r([]);
        }
      }, 10);
    });
  }
}
export default Korockle;
