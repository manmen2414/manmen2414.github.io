const PJSKCSS = (chara, index) =>
  `#pjsk-charas>li:nth-child(${index + 1})>a::after{content:"→ ${chara}";}\n`;

$(() => {
  let css = "";
  setTimeout(() => {
    //FIXME: Base.jsでイベント制制御を導入し、テーマの適用イベントによって変更させる
    const isDark = $("body").hasClass("dark");
    const pjskCharas = $("#pjsk-charas");
    const charas = ["ichika", "mafuyu", "mizuki"];
    const LIGHT_CHARA_COLOR = ["#2573a0", "#3b3b5eff", "#80526dff"];

    [...pjskCharas.children()].forEach((li, i) => {
      if (!isDark) {
        const a = li.querySelector("a");
        a.style.color = LIGHT_CHARA_COLOR[i];
      }
      css += PJSKCSS(getTranslate(`index.descripton.pjsk.${charas[i]}`), i);
    });
    $(`<style>${css}</style>`).appendTo($("head"));
  }, 100);
});
