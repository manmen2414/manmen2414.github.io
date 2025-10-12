/**
 * @param {string[][]} csv
 */
function csvToStr(csv) {
  return csv
    .map((sa) => sa.map((s) => s.replaceAll(",", "\u200b,")).join(","))
    .join("\n");
}
const parseBool = (s) => s === "true";
$(() => {
  const genUI = $("#genui");
  let translates = {
    amount: "",
    item: "",
    price: "",
    shop: "",
    additem: "",
    buying: "",
  };
  /**@param {JQuery<HTMLDivElement>} shopDiv */
  function addItem(shopDiv) {
    const ul = shopDiv.children("ul");
    const item = $(`<li>
          <button class="item-delete">×</button>
          <input type="checkbox" name="isbuying" class="isbuying" id="isbuying">
          <label for="isbuying">${translates.buying}</label>
          <input type="number" class="amount-text" placeholder="${translates.amount}">x
          <input type="text" class="item-text" placeholder="${translates.item}">
          <input type="text" class="price-text" placeholder="${translates.price}">
        </li>`);
    ul.append(item);
    item.children(".item-delete").on("click", (ev) => {
      ev.target.parentElement.remove();
    });
  }
  function addShop() {
    translates = {
      amount: getTranslate("forme.lc.amount-placeholder"),
      item: getTranslate("forme.lc.item-placeholder"),
      price: getTranslate("forme.lc.price-placeholder"),
      shop: getTranslate("forme.lc.shop-placeholder"),
      additem: getTranslate("forme.lc.additem"),
      buying: getTranslate("forme.lc.isbuying"),
    };
    const shop = $(`<div>
      <button class="shop-delete">×</button>
      <input class="shop-title title-smaller" type="text" placeholder="${translates.shop}"><br>
      <button class="additem">${translates.additem}</button>
      <ul></ul> </div>`);
    genUI.append(shop);
    shop.children(".shop-delete").on("click", (ev) => {
      ev.target.parentElement.remove();
    });
    shop.children(".additem").on("click", (ev) => {
      addItem($(ev.target.parentElement));
    });
  }
  function tocsv() {
    /**@type {string[][]} */
    const csv = [
      ["shopname", "isbuying", "amount", "itemname", "price", "..."],
    ];
    /**@param {JQuery<HTMLDivElement>} shopDiv */
    function toShopArray(shopDiv) {
      /**@type {string[]} */
      const arr = [];
      arr.push(shopDiv.children(".shop-title").val());
      [...shopDiv.children("ul").children("li")].forEach((item) => {
        arr.push(
          item.querySelector(".isbuying").checked.toString(),
          item.querySelector(".amount-text").value,
          item.querySelector(".item-text").value,
          item.querySelector(".price-text").value
        );
      });
      return arr;
    }
    [...genUI.children()].forEach((shop) => {
      csv.push(toShopArray($(shop)));
    });
    return csv;
  }
  /**
   * @param {string} csvStr
   */
  function fromcsv(csvStr) {
    const lines = csvStr.split(/\r|\n|\r\n/).slice(1);

    genUI.html("");
    const shops = [];
    lines.forEach((line) => {
      const arr = line.split(",").map((c) => c.replaceAll("\u200b", ","));
      const shopName = arr[0];
      if (shops.findIndex((v) => v === shopName) === -1) {
        shops.push(shopName);
        addShop();
        genUI.children("div:last-child").children(".shop-title").val(shopName);
      }
      if ((arr.length - 1) % 4 !== 0) throw new Error("this is not item data");
      const shop = genUI.children("div:last-child");
      for (let i = 1; i < arr.length; i += 4) {
        const isBuying = parseBool(arr[i]);
        const amount = arr[i + 1];
        const itemName = arr[i + 2];
        const price = arr[i + 3];
        addItem(shop);
        const item = shop.children("ul").children("li:last-child")[0];
        item.querySelector(".isbuying").checked = isBuying;
        item.querySelector(".amount-text").value = amount;
        item.querySelector(".item-text").value = itemName;
        item.querySelector(".price-text").value = price;
      }
    });
  }
  function format() {
    let text = "";
    const priceReps = {
      c: ":lc_c:",
      i: ":lc_i:",
      g: ":lc_g:",
      e: ":lc_e:",
      d: ":lc_d:",
      n: ":lc_n:",
      E: ":emerald:",
    };
    [...genUI.children()].forEach((shop) => {
      text += `## ${shop.querySelector(".shop-title").value}\n`;
      shop
        .querySelector("ul")
        .querySelectorAll("li")
        .forEach((item) => {
          const isbuy = item.querySelector(".isbuying").checked;
          text += `- ${isbuy ? "買" : "売"} [`;
          text += `${item.querySelector(".amount-text").value}x`;
          text += ` ${item.querySelector(".item-text").value}] `;
          text += strReplaceObject(
            item.querySelector(".price-text").value,
            priceReps
          );
          text += `\n`;
        });
    });
    return text;
  }

  $("#save").on("click", () => {
    downloadText(csvToStr(tocsv()), "shop.csv");
  });
  $("#load").on("click", () => {
    $("#load-csv")[0].click();
  });
  $("#format").on("click", (ev) => {
    navigator.clipboard.writeText(format());
    ev.target.innerText = "Copied!";
    setTimeout(() => {
      ev.target.innerText = "Format/Copy";
    }, 2000);
  });
  $("#addshop").on("click", () => {
    addShop();
  });
  onFileSelected($("#load-csv")[0], (text) => {
    fromcsv(text);
  });
});
