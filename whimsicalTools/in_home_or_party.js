/**@type {JQuery<HTMLTextAreaElement>} */
let selections = null;
/**@type {JQuery<HTMLDivElement>} */
let text = null;
/**
 * @param {string[]} args
 */
function apply(args) {
  let applied = `%%%でも%%%でも、%%%て%%%や%%%を%%%ましょう！`;
  args.forEach((v) => {
    applied = applied.replace("%%%", v);
  });
  applied = applied.replaceAll("%%%", "");
  text.text(applied);
}
function getSelections() {
  const select = selections.val();
  if (!select) return;
  return select.split(/\r\n|\r|\n/);
}

function applyFromText() {
  apply(getSelections());
}

function applyFromRandom() {
  apply(getSelections().sort(() => Math.random() - 0.5));
}

function applyFromRandomDuplication() {
  const allSelected = getSelections() ?? [];
  const select = [];
  for (let i = 0; i < 6; i++) select.push(randomFromArray(allSelected));
  apply(select);
}
$(() => {
  selections = $("#selections");
  text = $("#text");
  $("#IHoP-title").text(
    "\u5bb6\u3067\u3082\u30d1\u30fc\u30c6\u30a3\u30fc\u3067\u3082\u3001\u30a8\u30c3\u30c1\u306a\u670d\u3092\u7740\u3066\u53cb\u9054\u3084\u5bb6\u65cf\u3092\u6016\u304c\u3089\u305b\u307e\u3057\u3087\u3046\uff01"
  );
  $("#go").on("click", () => applyFromText());
  $("#gorandom").on("click", () => applyFromRandom());
  $("#gorandom-multipy").on("click", () => applyFromRandomDuplication());
  text.text("？でも？でも、\r？て？や？を？ましょう！");
  $("#color").on("change", (el) => {
    const color = $("#color").val() ?? "#ffffff";
    $("#img-pos").css("background-color", color);
  });
});
