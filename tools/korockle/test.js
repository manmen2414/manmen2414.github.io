import * as korockle from "./node.js";
korockle.getKorockle().then(async (h) => {
  const koro = new korockle.Korockle(h);
  await koro.sound(3);
  await h.close();
});
