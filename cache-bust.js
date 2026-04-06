const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const version = Date.now();

html = html.replace(/style\.css(\?v=[0-9]+)?/g, `style.css?v=${version}`);
// Note: JS module imports don't get cache-bust suffix — Vite handles hashing during build.

fs.writeFileSync(indexPath, html);
