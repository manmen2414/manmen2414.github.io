//@ts-check
import { COMMANDID } from "./commandId.js";
import { Korockle } from "./korockle.js";
import { checkUint8, toUint8 } from "./util.js";

class LongDataWriter {
  static SEGMENT_SIZE = 3000;
  static MAX_SEGMENT_LENGTH = 62;
  /**@type {Korockle} */
  korockle;
  /**@type {number[]} */
  data;
  offset = 0;
  sendedSegmentCount = 0;
  segmentSize = LongDataWriter.SEGMENT_SIZE;
  /**
   * @param {Korockle} korockle
   * @param {number[]} data
   */
  constructor(korockle, data) {
    this.korockle = korockle;
    this.data = data;
  }
  async send() {
    const sendData = [];
    const remainingDataLength = this.data.length - this.offset;
    const reportId = toUint8(
      remainingDataLength <= 62
        ? 0b10000000 | remainingDataLength
        : LongDataWriter.MAX_SEGMENT_LENGTH
    );

    for (let i = 0; i < LongDataWriter.MAX_SEGMENT_LENGTH; i++) {
      if (this.offset + i < this.data.length) {
        sendData[i] = this.data[this.offset + i];
      } else {
        sendData[i] = 0; // パディング
      }
    }
    this.offset += LongDataWriter.MAX_SEGMENT_LENGTH;
    this.sendedSegmentCount++;
    // TODO:10セグメントごと、またはデータが終了した場合にレスポンスを待つ
    /*
  if (segmentCount % 10 == 0 || offset >= data.length) {
    deviceInputReportHandler = handleHidInputReport.bind(
      this,
      0,
      (responseCode) => {
        callback(responseCode);
      }
    );
    await connectedDeviceInfo.sendReport(0, buffer);
  }*/
    await this.korockle.sendData(COMMANDID.dataSegment, reportId, sendData);
    if (!(this.offset >= this.data.length)) {
      await this.send();
    }
  }
}

export { LongDataWriter };
