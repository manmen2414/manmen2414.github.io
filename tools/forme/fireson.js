/**
 *
 * @param {string} displayName
 * @param {number} age
 * @param {string} title
 * @param {string[]} tags
 * @param {string} systemStyle
 * @param {string} catchphrase
 * @param {string} imageUrl
 * @param {string} icon
 * @param {string} id
 */
function generatePersonaScript(
  displayName = "",
  age = NaN,
  title = "",
  tags = [],
  systemStyle = "",
  catchphrase = "",
  imageUrl = "",
  icon = "",
  id = "my_persona",
) {
  const object = {
    age,
    catchphrase,
    display_name: displayName,
    icon,
    id,
    system_style: systemStyle,
    tags,
    title,
  };

  const objectInnerStringed = JSON.stringify(JSON.stringify(object));
  const urlStringed = JSON.stringify(imageUrl);

  return `localStorage.setItem("chatx.myPersona",${objectInnerStringed});localStorage.setItem("chatx.myProfileImage",${urlStringed});alert("適用が完了しました。");`;
}

$(() => {
  $("#cp-export").on("click", () => {
    const script = generatePersonaScript(
      $("#cp-displayName").val(),
      parseFloat($("#cp-age").val()),
      $("#cp-title").val(),
      $("#cp-tags")
        .val()
        .toString()
        .split(/\r|\n|\r\n/g),
      $("#cp-system_style").val(),
      $("#cp-catchphrase").val(),
      $("#cp-url").val(),
      $("#cp-icon").val(),
      $("#cp-id").val(),
    );

    navigator.clipboard.writeText(script);
    alert("スプリクトをクリップボードにコピーしました。");
  });
});
