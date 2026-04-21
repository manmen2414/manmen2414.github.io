/**
 * // TODO: audioCtxを1つにまとめ複数のコロックル音を再生できるように配列を受け取り再生できるようにしたい！！！
 * @param {kLib.Melody} melody
 */
async function playKorockleMDPFileOld(melody) {
  const wait = (sec) => new Promise((r) => setTimeout(r, sec * 1000));
  const audioCtx = new AudioContext();
  /**@type {[freq:number,reduceDecibel:number][]} */
  const freqs = [
    [1049, 0],
    [2093, -30.5],
    [3152, -2.9],
    [4192, -42.5],
    [5237, -5.75],
    [6291, -37.7],
    [7334, -28.1],
    [8376, -56.5],
    [9179, -47.9],
  ];

  /**@param {number} dB */
  const relativedB2Percentage = (dB) => 10 ** (dB / 20);

  const baseVolume = 0.5;
  function call(addFreq, sec) {
    const mainFreq = [1049, 2090, 3147, 5283];

    freqs.forEach(([freq, decibel], i) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        freq + addFreq * (i + 1),
        audioCtx.currentTime,
      );
      const gain = audioCtx.createGain();
      gain.gain.value =
        (baseVolume * relativedB2Percentage(decibel)) / freqs.length;
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + (sec - 0.05));
    });
    return wait(sec);
  }
  const callList = [
    ,
    ,
    -306,
    -262.009,
    -215.4,
    -166,
    -113.7,
    -58.2,
    0,
    62.7,
    128.6,
    198.5,
    272.51,
    350.913,
    434,
    521.982,
    615.219,
    714,
    818.655,
    929.5,
    1044,
    1171.5,
    1303.3,
    1443.016,
    1591.02,
    1747.826,
    1913.955,
    2089.963,
    2276.438,
    2474,
    2683.31,
    2905.066,
  ];
  let stopPlay = () => {};
  stopPlay();
  const tempo = melody.bpm;
  const beatsecond = 60 / tempo;
  const times = [
    beatsecond / 4,
    beatsecond / 2,
    (beatsecond / 4) * 3,
    beatsecond,
    beatsecond * 1.5,
    beatsecond * 2,
    beatsecond * 3,
    beatsecond * 4,
  ];
  let playing = false;
  let noteIndex = 0;

  const obj = {
    /**
     * @param {kLib.Note} note
     * @param {number} index
     * @param {kLib.Melody} melody
     */
    oncall: (note, index, melody) => {},
    /**@readonly */
    stop: () => {
      playing = false;
      noteIndex = 0;
    },
    /**@readonly */
    pause: () => {
      playing = false;
    },
    /**@readonly */
    resume: () => {
      startPlay();
    },
    /**@readonly */
    play: () => {
      startPlay();
    },
  };
  let justTime = 0;
  /**
   * @param {number} i
   */
  async function callNote(i) {
    const note = melody.notes[i];
    const add = callList[note.scale];
    const originalTime = times[note.length];
    // 本来の時間とずれてたら修正する
    const offset = justTime - audioCtx.currentTime;
    justTime += originalTime;
    const offsettedTime = originalTime + offset;
    obj.oncall(note, i, melody);
    if (add === undefined) await wait(offsettedTime);
    else await call(add, offsettedTime);
    // console.log(justTime - audioCtx.currentTime);
    // console.warn(melody.notes.length, audioCtx.currentTime, justTime);
  }
  async function startPlay() {
    console.log(times);
    playing = true;
    for (; noteIndex < melody.notes.length; noteIndex++) {
      if (!playing) break;
      await callNote(noteIndex);
    }
  }
  return obj;
}

export { playKorockleMDPFileOld };
