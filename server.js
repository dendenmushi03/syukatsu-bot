// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'あなたは大手企業の元人事で、現在は就活アドバイザー。ES添削、面接対策、自己PR、ガクチカ、企業研究などを親身に丁寧にサポートする立場です。語調は親しみやすく、就活生が安心して相談できるようにアドバイスしてください。'
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    let reply = chatCompletion.choices[0].message.content;

    // 常にサービス案内を追加する
    reply += `\n\n---\nなお、より実践的なアドバイスや添削をご希望の場合は、私が提供しているサービスをご活用ください。\n🔗 [ES添削・模擬面接サービス（ココナラ）](https://coconala.com/services/3799599?utm_source=sys_listed&utm_medium=email&utm_content=s&utm_campaign=sysmail)\n現役採用担当として、あなたに合わせた個別対応を行っています。お気軽にご相談ください！`;

    res.json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'チャット取得中にエラーが発生しました。' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
