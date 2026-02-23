const PJSKCSS = (chara, index) =>
  `#pjsk-charas>li:nth-child(${index + 1})>a::after{content:"→ ${chara}";}\n`;
const LIGHT_CHARA_COLOR = [
  "rgb(33, 86, 117)",
  "rgb(53, 53, 99)",
  "rgb(95, 66, 83)",
];
const DARK_CHARA_COLOR = ["#33aaee", "#6c6caf", "#d482b3"];

$(() => {
  const pjskCharas = $("#pjsk-charas");
  const lis = [...pjskCharas.children()];
  PageLoadEventTarget.addEventListener("themeload", (ev) => {
    const themeColor = theme === "d" ? DARK_CHARA_COLOR : LIGHT_CHARA_COLOR;
    lis.forEach((li, i) => {
      const a = li.querySelector("a");
      a.style.color = themeColor[i];
    });
  });
  PageLoadEventTarget.addEventListener("translateEnd", (ev) => {
    const charas = ["ichika", "mafuyu", "mizuki"];
    let css = "";
    lis.forEach((li, i) => {
      css += PJSKCSS(getTranslate(`index.descripton.pjsk.${charas[i]}`), i);
    });
    $(`<style>${css}</style>`).appendTo($("head"));
  });
});
