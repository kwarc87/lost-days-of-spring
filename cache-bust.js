const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const version = Date.now();

html = html.replace(/style\.css(\?v=[0-9]+)?/g, `style.css?v=${version}`);
html = html.replace(
    /LostDaysOfSpring\.js(\?v=[0-9]+)?/g,
    `LostDaysOfSpring.js?v=${version}`,
);

fs.writeFileSync(indexPath, html);
