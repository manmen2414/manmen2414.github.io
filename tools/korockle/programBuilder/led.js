import { NumRange, Uint8 } from "../util";
import { Color } from "./color";
import { BaseBuildHelper } from "./main";
interface LEDSetting {
  color?: Color;
  action?: "on" | "off" | "time_on";
  melodySync?: boolean;
  animation?: "none" | "change" | "off";
}
class LED implements BaseBuildHelper {
  color: Color;
  action: "on" | "off" | "time_on" = "on";
  melodySync: boolean = false;
  animation: "none" | "change" | "off" = "none";
  special = { noIndexNumber: false, waitTick: 0 };
  constructor(setting: LEDSetting = {}) {
    this.color = setting.color ?? new Color(10, 10, 10);
    this.action = setting.action ?? this.action;
    this.melodySync = setting.melodySync ?? this.melodySync;
    this.animation = setting.animation ?? this.animation;
  }
  build(buildHelpers: BaseBuildHelper[], index: number): Uint8[] {
    if (this.action === "on") {
      //TODO: ビルド実装
    }
    return [];
  }
}

export default LED;
