
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

window.onload = () => {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach(msg => appendMessage(msg.text, msg.sender));
};

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  saveToHistory(text, 'user');
  userInput.value = '';
  showTypingIndicator();
  fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
  .then(res => res.json())
  .then(data => {
    removeTypingIndicator();
    appendMessage(data.reply, 'bot');
    saveToHistory(data.reply, 'bot');
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
}

function saveToHistory(text, sender) {
  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ text, sender });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing';
  typingDiv.classList.add('message', 'typing-indicator');
  typingDiv.textContent = 'Sutra टाइप कर रहा है...';
  chatBox.appendChild(typingDiv);
}

function removeTypingIndicator() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'hi-IN';
  recognition.start();
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
  };
}

userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});
