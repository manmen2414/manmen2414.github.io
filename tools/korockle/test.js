import * as korockle from "./node.js";
korockle.getKorockle().then(async (h) => {
  const koro = new korockle.Korockle(h);
  await koro.writeMelody([0, (30 << 3) + 7, 0]);
  await koro.melody("once");
});
