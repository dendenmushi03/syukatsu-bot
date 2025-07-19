document.getElementById('chat-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const input = document.getElementById('user-input');
  const message = input.value;
  appendMessage('user', message);
  input.value = '';

  appendMessage('bot', '考え中...');

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  const botBubble = document.querySelector('.bot:last-child');
  botBubble.innerText = data.reply;
});

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}
