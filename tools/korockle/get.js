import { hid } from "./util.js";

async function getKorockle() {
  const [korockle] = await hid.requestDevice({
    filters: [
      {
        vendorId: 3141,
        productId: 28740,
      },
    ],
  });
  if (!korockle) throw new Error("Korockle Not Found");
  await korockle.open();
  return korockle;
}
export default getKorockle;
