const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

// Generujemy nowy unikalny timestamp
const version = Date.now();

// Podmieniamy parametry ?v= w linkach do css i js
html = html.replace(/style\.css(\?v=[0-9]+)?/g, `style.css?v=${version}`);
html = html.replace(
    /\.\/src\/main\.js(\?v=[0-9]+)?/g,
    `./src/main.js?v=${version}`,
);

fs.writeFileSync(indexPath, html);
