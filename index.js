/**
 * @typedef {{id: string;favorites: { id: string; name: string; color: { l: string; d: string } }[]}} GameInfo
 */

/**
 * @param {GameInfo} game
 * @param {number} charaIndex
 */
const makeCharaCSS = (game, charaIndex) =>
  `#${game.id}-charas>li:nth-child(${charaIndex + 1})>a::after{content:"→ ${game.favorites[charaIndex].name}";}\n`;

/**
 * @type {GameInfo[]}
 */
const gamesInfomation = [
  {
    id: "pjsk",
    favorites: [
      {
        id: "ichika",
        name: "",
        color: {
          l: "rgb(33, 86, 117)",
          d: "#33aaee",
        },
      },
      {
        id: "mafuyu",
        name: "",
        color: {
          l: "rgb(53, 53, 99)",
          d: "#6c6caf",
        },
      },
      {
        id: "mizuki",
        name: "",
        color: {
          l: "rgb(95, 66, 83)",
          d: "#d482b3",
        },
      },
    ],
  },
  {
    id: "gakumas",
    favorites: [
      {
        id: "lilja",
        name: "",
        color: {
          l: "#0f0100",
          d: "#f0feff",
        },
      },
    ],
  },
];

/**
 * @param {JQuery<HTMLElement>} targetElement
 */
function initGames() {
  let css = "";
  for (const game of gamesInfomation) {
    const charas = $(`#${game.id}-charas`);
    const charaElementList = [...charas.children()];
    PageLoadEventTarget.addEventListener("themeload", (ev) => {
      charaElementList.forEach((li, i) => {
        const a = li.querySelector("a");
        a.style.color = game.favorites[i].color[theme];
      });
    });
    PageLoadEventTarget.addEventListener("translateEnd", (ev) => {
      charaElementList.forEach((li, i) => {
        game.favorites[i].name = getTranslate(
          `index.descripton.${game.id}.${game.favorites[i].id}`,
        );
        css += makeCharaCSS(game, i);
        $(`<style>${css}</style>`).appendTo($("head"));
      });
    });
  }
}

function initLilja() {
  // 特例()
  PageLoadEventTarget.addEventListener("translateEnd", (ev) => {
    if (translateLang === "ja")
      $("#gakumas-charas")
        .children(0)
        .children(0)
        .attr("aria-label", "レジェンドマンモスさんランク, 葛城リーリヤ");
  });
}

$(() => {
  initGames();
  initLilja();
});
