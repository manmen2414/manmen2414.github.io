/**@type {{value:number,time:Date}[]} */
const batteryData = [];
/**@param {Date} date  */
function dateMMSS(date = new Date()) {
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const hours = date.getHours();
  const formattedMinutes = ("" + minutes).padStart(2, "0");
  const formattedSeconds = ("" + seconds).padStart(2, "0");
  const formattedHours = ("" + hours).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
function generateData() {
  return {
    labels: batteryData.map((v) => dateMMSS(v.time)),
    datasets: [
      {
        label: "Battery",
        data: batteryData.map((v) => v.value),
        fill: false,
        borderColor: "#595",
        tension: 0.1,
      },
    ],
  };
}
/**@type {Chart} */
let chart = { canvas: null, destroy: () => {} };
function infoTick(battery) {
  const value = Math.round(battery.level * 100);
  const chargeing = battery.charging;
  const isDark = document.body.classList.contains("dark");
  const boltSVG = $("#bolt");
  if (isDark) boltSVG.attr("fill", "#fff");
  else boltSVG.attr("fill", "#000");
  boltSVG.css("opacity", chargeing ? 1 : 0);
  batteryData.push({
    value,
    time: new Date(),
  });
  const canvas = chart.canvas ?? $("#graph-battery");
  chart.destroy();
  chart = new Chart(canvas, {
    type: "line",
    data: generateData(),
    options: {
      animation: false,
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 100,
          display: true,
        },
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    },
  });
}
$(() => {
  $("#clear").on("click", () => {
    batteryData.length = 0;
  });
  if (!navigator.getBattery) {
    setTimeout(() => {
      alert(getTranslate("battery.notworking"));
    }, 200);
    return;
  }
  navigator.getBattery().then((battery) => {
    setInterval(() => {
      infoTick(battery);
    }, 1000);
  });
});
