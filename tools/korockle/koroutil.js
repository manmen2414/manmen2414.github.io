import * as kLib from "../koroLib/main/web.js";

/**
 * @param {string} file
 * @returns {kLib.MelodyBuilder}
 */
export function mdpFileToMelodyBuilder(file) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(file, "text/xml");
  const isMDP = xml.getElementsByTagName("MelodyModule").length === 1;
  const bpmIndex = parseInt(xml.querySelector("tempoIndex")?.innerHTML ?? "");
  const ledFlag = xml.querySelector("ledFlag")?.innerHTML === "true";
  if (!isMDP || isNaN(bpmIndex)) {
    throw new Error(getTranslate("@korockle.file.nomelody"));
    return;
  }
  const notes = xml.querySelector("Keys").children;
  const melodyBuilder = new kLib.MelodyBuilder(bpmIndex, ledFlag);
  for (let i = 0; i < notes.length; i++) {
    const key = notes[i];
    const rankStr = key.querySelector("Rank")?.innerHTML;
    const lengthStr = key.querySelector("Length")?.innerHTML;

    if (!rankStr || !lengthStr) {
      throw new Error(getTranslate("@korockle.file.nomelody"));
    }

    /**@type {number?} */
    const rank = kLib.NOTE_SCALES[rankStr];
    /**@type {number?} */
    const length = kLib.NOTE_LENGTHS[lengthStr];
    if (!rank && rank !== 0) continue;
    if (!length && length !== 0) continue;

    melodyBuilder.addNoteV(rank, length);
  }
  return melodyBuilder;
}

const scaleStrings = [
  "REST",
  "LOW_FA_SHARP",
  "LOW_SO",
  "LOW_SO_SHARP",
  "LOW_RA",
  "LOW_RA_SHARP",
  "LOW_SI",
  "DO",
  "DO_SHARP",
  "RE",
  "RE_SHARP",
  "MI",
  "FA",
  "FA_SHARP",
  "SO",
  "SO_SHARP",
  "RA",
  "RA_SHARP",
  "SI",
  "HIGH_DO",
  "HIGH_DO_SHARP",
  "HIGH_RE",
  "HIGH_RE_SHARP",
  "HIGH_MI",
  "HIGH_FA",
  "HIGH_FA_SHARP",
  "HIGH_SO",
  "HIGH_SO_SHARP",
  "HIGH_RA",
  "HIGH_RA_SHARP",
  "HIGH_SI",
];
const lengthStrings = [
  "SIXTEEN",
  "EIGHT",
  "EIGHT_DOT",
  "FOUR",
  "FOUR_DOT",
  "TWO",
  "TWO_DOT",
  "ONE",
];

/**
 * @param {kLib.MelodyBuilder} melody
 * @returns {string}
 */
export function melodyBuilderToMDP(melody) {
  const xml = document.implementation.createDocument("", "", null);
  const root = xml.createElement("root");
  const MelodyModule = xml.createElement("MelodyModule");
  MelodyModule.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
  MelodyModule.setAttribute(
    "xmlns:xsi",
    "http://www.w3.org/2001/XMLSchema-instance",
  );

  const Keys = xml.createElement("Keys");

  melody.notes.forEach(({ scale, length }) => {
    const scaleStr = scaleStrings[scale - 1];
    const lengthStr = lengthStrings[length];
    if (!scaleStr || !lengthStr) {
      throw new Error(`Invalid Note: S${scale} L${length}`);
    }
    Keys.innerHTML += `<Key><Rank>${scaleStr}</Rank><Length>${lengthStr}</Length></Key>`;
  });

  const tempoIndex = xml.createElement("tempoIndex");
  tempoIndex.innerHTML = melody.bpmIndex;
  const ledFlag = xml.createElement("ledFlag");
  ledFlag.innerHTML = melody.isLEDLinked;
  MelodyModule.innerHTML += `<Report><Grade /><Class /><Number /><Name /><Comment /></Report>`;

  MelodyModule.append(Keys, tempoIndex, ledFlag);
  root.append(MelodyModule);
  let text = root.innerHTML;
  text = `<?xml version="1.0" encoding="utf-8"?>` + text;
  return text;
}
