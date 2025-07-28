import { Uint8 } from "../util";

interface BaseBuildHelper {
  special: {
    noIndexNumber: boolean;
    waitTick: number;
  };
  build(buildHelpers: BaseBuildHelper[], index: number): Uint8[];
}

export { BaseBuildHelper };
