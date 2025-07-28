type PmsUndef = Promise<undefined>;
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;
type ByteArray = ArrayBuffer | TypedArray | DataView;
interface HID {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: HIDDeviceRequestOption): Promise<HIDDevice[]>;
}
interface HIDDevice extends EventTarget {
  opened: boolean;
  productId: number;
  productName: string;
  vendorId: number;
  close(): PmsUndef;
  forget(): PmsUndef;
  open(): PmsUndef;
  receiveFeatureReport(reportId: number): Promise<DataView>;
  sendFeatureReport(reportId: number, data: ByteArray): PmsUndef;
  sendReport(reportId: number, data: ByteArray): PmsUndef;
}
interface HIDDeviceRequestOption {
  filters: {
    vendorId?: number;
    productId?: number;
  }[];
}
interface HIDInputReportEvent {
  data: DataView;
  device: HIDDevice;
  reportId: number;
}
