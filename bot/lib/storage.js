const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, "utf-8");
  return JSON.parse(raw);
}

function writeJson(filePath, obj) {
  const abs = path.resolve(filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2), "utf-8");
}

module.exports = { readJson, writeJson };
