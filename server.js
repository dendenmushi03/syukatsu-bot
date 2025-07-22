const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ← 画像を使うためのstatic対応

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
あなたは大手企業の元人事で、現在は就活アドバイザーです。
ES添削、面接対策、自己PR、ガクチカ、企業研究などを親身にサポートしてください。
語調は丁寧かつ親しみやすく、回答は2段落以内にまとめてください。

その後、以下の画像付きサービス紹介文を必ず付けてください：

---
なお、より実践的なアドバイスや添削をご希望の場合は、私が提供しているサービスをご活用ください。<br>
<a href="https://coconala.com/services/3799599?utm_source=sys_listed&utm_medium=email&utm_content=s&utm_campaign=sysmail" target="_blank">
  <img src="/banner.jpeg" alt="ES添削・模擬面接サービス" style="width:100%; max-width:500px; border-radius:10px; margin-top:10px;" />
</a><br>
現役採用担当として、あなたに合わせた個別対応を行っています。お気軽にご相談ください！
`
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'チャット取得中にエラーが発生しました。' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
