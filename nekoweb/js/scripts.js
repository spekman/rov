fetch("https://status.cafe/users/rov/status.json")
  .then((r) => r.json())
  .then((r) => {
    if (!r.content.length) {
      document.getElementById("statuscafe-content").innerHTML =
        "No status yet.";
      return;
    }
    // unnecessarily converting "x days ago" to YYYY-MM-DD
    const time = r.timeAgo.split(" ")[0];
    let date = new Date();
    r.timeAgo.includes("hours")
      ? date.setHours(date.getHours() - time)
      : date.setDate(date.getDate() - time);
    date = date.toISOString().substring(0, 10);

    document.getElementById("statuscafe-date").innerHTML = date;
    document.getElementById("statuscafe-content").innerHTML =
      `<a href="https://status.cafe/users/rov" target="_blank">@${r.author}</a>: ${r.content}`;
  });

const darkModeButton = document.getElementById("toggle-dark-mode");
// still don't know if the text should show dark mode while in light mode or the opposite lmao
darkModeButton.addEventListener("click", function () {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    darkModeButton.textContent = "DARK MODE";
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    darkModeButton.textContent = "LIGHT MODE";
  }
});

let root = document.documentElement.style;
const color1 = root.getPropertyValue("--dark-primary-color"),
  color2 = root.getPropertyValue("--dark-secondary-color");

const palettes = [
  [color1, color2],
  ["#222", "#8E1"],
  ["#214", "#F53"],
  ["#123", "#9DF"],
  ["#423", "#BCB"],
  ["#233", "#DB4"],
  ["#D10", "#6EF"],
  ["#200", "#0FB"],
  ["#307", "#FC8"],
  ["#C26", "#EFF"],
];
let current = 0;

const paletteButton = document.getElementById("palette-button");

paletteButton.addEventListener("click", function () {
  current = ++current % palettes.length;
  root.setProperty("--dark-primary-color", palettes[current][0]);
  root.setProperty("--light-secondary-color", palettes[current][0]);
  root.setProperty("--light-primary-color", palettes[current][1]);
  root.setProperty("--dark-secondary-color", palettes[current][1]);
});

const crt = document.querySelector(".crt");
const crtButton = document.getElementById("toggle-crt");

crtButton.addEventListener("click", function () {
  crt.classList.toggle("hidden");
});

// this script is under the MIT license (https://max.nekoweb.org/resources/license.txt)

const USERNAME = "mimimidore"; // Put your LastFM username here
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

const getTrack = async () => {
  try {
    const request = await fetch(BASE_URL);
    if (!request.ok) {
      throw new Error(`HTTP error! status: ${request.status}`);
    }
    const json = await request.json();

    // Values:
    // COVER IMAGE: json.track.image[1]['#text']
    // TITLE: json.track.name
    // ARTIST: json.track.artist['#text']

    // const imageUrl = json.track?.image[1]?.["#text"] || "";
    const trackName = json.track?.name || "Unknown";
    const artistName = json.track?.artist?.["#text"] || "Unknown Artist";

    const listeningEl = document.getElementById("listening");
    if (listeningEl) {
      listeningEl.innerHTML = `${artistName} - ${trackName}`;
    }
  } catch (error) {
    console.error("Error fetching track:", error);
    const listeningEl = document.getElementById("listening");
    if (listeningEl) {
      listeningEl.innerHTML = "Unable to load track info";
    }
  }
};

getTrack();
setInterval(() => {
  getTrack();
}, 10000);
