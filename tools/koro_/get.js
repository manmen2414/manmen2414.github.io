async function getKorockle() {
  /**@type {HID} navigator.hidなんてあるよ うるせぇよ 黙れよ navigator.hidなんてあるよ node.js:85こそが正義 navigator.hidなんて あるよ 正しいのは俺*/
  const hid = navigator.hid;
  const [korockle] = await hid.requestDevice({
    filters: [
      {
        vendorId: 3141,
        productId: 28740,
      },
    ],
  });
  await korockle.open();
  return korockle;
}
export { getKorockle };
