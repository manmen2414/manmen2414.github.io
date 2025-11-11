interface PageLoadEventTarget extends EventTarget {
  addEventListener(
    type: "themeload",
    listener: (event: ThemeloadEvent) => void
  ): void;
  addEventListener(
    type: "versionload",
    listener: (event: VersionloadEvent) => void
  ): void;
  addEventListener(
    type: "generatedTopBar",
    listener: (event: GeneratedTopBarEvent) => void
  ): void;
  addEventListener(
    type: "generatedRightBar",
    listener: (event: GeneratedRightBarEvent) => void
  ): void;
  addEventListener(
    type: "translateStart",
    listener: (event: TranslateStartEvent) => void
  ): void;
  addEventListener(
    type: "translateEnd",
    listener: (event: TranslateEndEvent) => void
  ): void;
  dispatchEvent(
    event:
      | ThemeloadEvent
      | VersionloadEvent
      | GeneratedTopBarEvent
      | GeneratedRightBarEvent
      | TranslateStartEvent
      | TranslateEndEvent
  ): boolean;
}

interface ThemeloadEvent extends Event {
  /**テーマのID。 */
  cancelable: false;
}
interface VersionloadEvent extends Event {
  /**バージョン。 */
  cancelable: false;
}
interface GeneratedTopBarEvent extends Event {
  cancelable: false;
}
interface GeneratedRightBarEvent extends Event {
  cancelable: false;
}
interface TranslateStartEvent extends Event {
  cancelable: true;
}
interface TranslateEndEvent extends Event {
  cancelable: false;
}

/** https://qiita.com/yoshi-maru/items/f0245ea25b5848305de4 */
type Dictionary<TKey extends string | number | symbol, TValue> = {
  [key in TKey]: TValue;
};
