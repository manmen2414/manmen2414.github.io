import * as nodeHid from "node-hid";

/**
 * @param {Buffer} buff
 * @returns
 */
function bufferToDataView(buff) {
  return new DataView(new Uint8Array(buff).buffer);
}

class NodeHidDevice extends EventTarget {
  /**
   * @param {nodeHid.Device} device
   */
  constructor(device) {
    super();
    this.productId = device.productId;
    this.productName = device.product;
    this.vendorId = device.vendorId;
    this._device = device;
  }
  /**@type {nodeHid.HIDAsync?} */
  _hid = null;
  opened = false;
  productName = "";
  async close() {
    if (!this._hid) throw new Error("Device Not Opened");
    this.opened = false;
    await this._hid.close();
    this._hid = null;
  }
  forget() {
    return this.close();
  }
  async open() {
    const hid = await nodeHid.HIDAsync.open(this.vendorId, this.productId);
    this._hid = hid;
    this.opened = true;
    hid.on("data", (buff) => {
      this.dispatchEvent(new NodeHIDInputReportEvent(this, buff));
    });
    return hid;
  }
  /**
   * @returns {Promise<DataView>}
   * @param {number} reportId
   */
  async receiveFeatureReport(reportId) {
    if (!this._hid) throw new Error("Device Not Opened");
    const data = await this._hid.getFeatureReport(reportId, 0);
    return bufferToDataView(data);
  }
  /**
   * @param {number} reportId
   * @param {ByteArray} data
   */
  sendFeatureReport(reportId, data) {
    if (!this._hid) throw new Error("Device Not Opened");
    return this._hid.sendFeatureReport([reportId, ...data]);
  }
  /**
   * @param {number} reportId
   * @param {ByteArray} data
   */
  sendReport(reportId, data) {
    if (!this._hid) throw new Error("Device Not Opened");
    return this._hid.write([reportId, ...data]);
  }
}

class NodeHIDInputReportEvent extends Event {
  /**
   * @param {NodeHidDevice} device
   * @param {Buffer} data
   */
  constructor(device, data) {
    super("inputreport", { cancelable: false });
    this.device = device;
    this.data = bufferToDataView(data);
    this.reportId = -1;
  }
}

navigator.hid = {
  /**
   * @returns {Promise<HIDDevice[]>}
   */
  async getDevices() {
    return (await nodeHid.devicesAsync()).map((d) => new NodeHidDevice(d));
  },
  /**
   * @param {HIDDeviceRequestOption} options
   * @returns {Promise<HIDDevice[]>}
   */
  async requestDevice(options) {
    //TODO: 複数に対応(必要？)
    const devices = await this.getDevices();
    const filter = options.filters[0];
    return devices.filter(
      (v) =>
        v.vendorId === (filter.vendorId ?? v.vendorId) &&
        v.productId === (filter.productId ?? v.productId)
    );
  },
};

export * from "./get.js";
export * from "./korockle.js";
export * from "./longdataWriter.js";
export * from "./util.js";
export * from "./programBuilder/color.js";
export * from "./melody/melody.js";
export * from "./melody/builder.js";
export * from "./melody/midi-parse.js";
