/**
 * GitHub Actions 用：ランダム1件を投稿 → 自分のツイートに固定リプ（3パターンからランダム）
 * 必要Secrets:
 *  - X_API_KEY
 *  - X_API_KEY_SECRET
 *  - X_ACCESS_TOKEN
 *  - X_ACCESS_TOKEN_SECRET
 *
 * 任意（Variables推奨）:
 *  - COCO_URL (デフォルト: https://coconala.com/services/3799599)
 */

const fs = require("fs");
const path = require("path");
const { TwitterApi } = require("twitter-api-v2");

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function loadTweetsFromTxt(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");

  // IDブロック開始で分割（ID:001｜カテゴリ:... の形式前提）
  const blocks = raw.split(/\n(?=ID:\d{3}｜)/g).map(s => s.trim()).filter(Boolean);

  // ヘッダーっぽい行を除去しつつ本文だけ抽出
  const tweets = blocks.map(block => {
    // 先頭行が "ID:xxx｜カテゴリ:yyy" を想定
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

    // もし先頭がID行じゃなければ無視
    if (!/^ID:\d{3}｜カテゴリ:/.test(lines[0] || "")) return null;

    // "ID行" を落として本文に
    const bodyLines = lines.slice(1);

    // 末尾の区切り "---" だけなら落とす
    while (bodyLines.length && bodyLines[bodyLines.length - 1] === "---") bodyLines.pop();

    const body = bodyLines.join("\n").trim();
    if (!body) return null;

    return body;
  }).filter(Boolean);

  return tweets;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fitTo280(text) {
  // 280超えは安全にカット（最後の改行境界を優先）
  if (text.length <= 280) return text;

  const hard = text.slice(0, 277) + "…";
  // できれば改行単位で短くする
  const cutAt = hard.lastIndexOf("\n");
  if (cutAt > 120) return hard.slice(0, cutAt) + "…";
  return hard;
}

async function main() {
  const client = new TwitterApi({
    appKey: mustEnv("X_API_KEY"),
    appSecret: mustEnv("X_API_KEY_SECRET"),
    accessToken: mustEnv("X_ACCESS_TOKEN"),
    accessSecret: mustEnv("X_ACCESS_TOKEN_SECRET"),
  });

const tweetsPath = path.resolve(__dirname, "data", "tweets.txt");
if (!fs.existsSync(tweetsPath)) {
  throw new Error(`tweets.txt not found at: ${tweetsPath}`);
}

  const tweets = loadTweetsFromTxt(tweetsPath);

  if (tweets.length < 1) {
    throw new Error("No tweet candidates parsed from tweets.txt (format must start with 'ID:xxx｜カテゴリ:...').");
  }

  // 50件運用なら、ここで安全に上限を固定（多くても50まで）
  const pool = tweets.slice(0, 50);

  const tweetText = fitTo280(pickRandom(pool));

  // 1) 投稿
  const posted = await client.v2.tweet(tweetText);
  const tweetId = posted?.data?.id;
  if (!tweetId) throw new Error("Tweet posted but tweetId not found.");

  // 2) 返信（毎回完全固定は避ける：3パターンからランダム）
  const cocoUrl = process.env.COCO_URL || "https://coconala.com/services/3799599";

  const replyTemplates = [
    `就活の個別相談（ES添削/面接対策/企業研究）もやってます。必要ならこちら👇\n${cocoUrl}`,
    `「自分のケースだとどう言えばいい？」みたいな相談はここで受けてます👇\n${cocoUrl}`,
    `ES・面接の文章を一緒に整える相談窓口👇（必要な人だけどうぞ）\n${cocoUrl}`,
  ];

  const replyText = fitTo280(pickRandom(replyTemplates));

  await client.v2.reply(replyText, tweetId);

  console.log("OK: tweeted and replied", { tweetId });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
