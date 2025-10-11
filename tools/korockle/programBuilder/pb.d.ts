interface Color {
  red: number;
  green: number;
  blue: number;
  constColor(): number;
  toString(): string;
  isNone(): boolean;
}
interface LEDSetting {
  color?: Color;
  time?: number;
  melodySync?: boolean;
  fade?: "in" | "out" | "none";
}

interface SubroutineSetting {
  routine?: number;
}
interface WaitSetting {
  /**秒単位*/
  time?: number;
}

interface SoundSetting {
  sound?: 1 | 2 | 3 | "melody_once" | "melody_loop" | "melody_stop";
}

interface CounterSetting {
  action?: "start" | "stop" | "reset";
}
type GenericBlock<T extends BaseBlock> = T;
type Variables = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type IfCondition =
  | "Button"
  | "Light"
  | "Sound"
  | "Alerm"
  | "Timer"
  | "Time"
  | "Temperature"
  | "Random"
  | "Counter"
  | "Variable"
  | "Input";
interface TimeValue {
  hour: number;
  minute: number;
}
namespace IfArgments {
  interface Button {
    activePushing: boolean;
  }
  interface Light {
    mode: "brighter" | "darker" | "same";
    /**
     * null時は明るい/暗いの判定を行う。
     * sameかつnullの場合はエラーとする。
     *  */
    num?: Variables | number;
  }
  interface Sound {
    activeHearing: boolean;
  }
  interface Alerm {
    activeOnAlerm: boolean;
  }
  interface Timer {
    activeOnTimer: boolean;
  }
  interface Time {
    compare: "earlier" | "same" | "later";
    time: TimeValue;
  }
  interface Temperature {
    compare: "lower" | "same" | "upper";
    num: Variables | number;
  }
  interface Random {}
  interface Counter {
    compare: "smaller" | "same" | "bigger";
    num: number;
  }
  interface Variable {
    base: Variables;
    num: Variables | number;
    compare: "smaller" | "same" | "bigger";
  }
  interface Input {
    activeInputing: boolean;
  }
  type All =
    | Button
    | Light
    | Sound
    | Alerm
    | Timer
    | Time
    | Temperature
    | Random
    | Counter
    | Variable
    | Input;
}

type ArithmeticOperations =
  | "="
  | "+="
  | "-="
  | "assignment"
  | "addition"
  | "subtraction";
interface ArithmeticSetting {
  target?: Variables;
  operation?: ArithmeticOperations;
  value?: number | Variables | "temperature" | "light";
}

type DisplayItems =
  | Variables
  | "None"
  | "Time"
  | "Temperature"
  | "Counter"
  | "Light"
  | "Waittime";

interface DisplaySetting {
  item?: DisplayItems;
}
