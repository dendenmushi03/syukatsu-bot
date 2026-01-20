const fs = require("fs");
const path = require("path");

/**
 * tweets.txt から ID:001｜カテゴリ:... ブロックを抽出して配列化
 * - 区切りは '---' が基本（ID:001〜050は揃ってる前提）
 * - ID:001〜050 だけを採用（51以降の崩れは無視）
 */
function parseTweetsFromTxt(txtPath) {
  const abs = path.resolve(txtPath);
  const raw = fs.readFileSync(abs, "utf-8").replace(/\r\n/g, "\n");

  // '---' 区切りでブロック化（末尾が '---' で終わらなくてもOK）
  const blocks = raw
    .split("\n---\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const out = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());

    // 先頭から "ID:xxx｜カテゴリ:yyy" を探す（タイトル行などが上にあっても拾える）
    const headerIdx = lines.findIndex((l) => /^ID\s*:\s*\d{3}\s*[｜|]/.test(l));
    if (headerIdx === -1) continue;

    const header = lines[headerIdx];
    const idMatch = header.match(/ID\s*:\s*(\d{3})/);
    const catMatch = header.match(/カテゴリ\s*:\s*(.+)$/);

    if (!idMatch) continue;
    const id = idMatch[1];

    // ID:001〜050だけに限定
    const idNum = Number(id);
    if (!(idNum >= 1 && idNum <= 50)) continue;

    const category = catMatch ? catMatch[1].trim() : "";

    // header行の次から末尾までを本文に（空行は軽く整理）
    const text = lines
      .slice(headerIdx + 1)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) continue;
    out.push({ id, category, text });
  }

  return out;
}

module.exports = { parseTweetsFromTxt };
