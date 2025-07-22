// 初回アクセス時に案内メッセージを表示
window.addEventListener('DOMContentLoaded', () => {
  const introMessage = "こんにちは！就活に関するお悩みや相談があれば、気軽に話しかけてくださいね。ES添削、面接対策、自己PRなど何でもOKです！";
  appendMessage('bot', introMessage);
});

document.getElementById('chat-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  appendMessage('bot', '考え中...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    const botBubble = document.querySelector('.bot:last-child');
    botBubble.innerHTML = data.reply;
  } catch (error) {
    const botBubble = document.querySelector('.bot:last-child');
    botBubble.innerText = 'エラーが発生しました。もう一度お試しください。';
  }
});

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;

  if (sender === 'bot') {
    bubble.innerHTML = text;  // ← HTML埋め込みに対応
  } else {
    bubble.innerText = text;
  }

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}
