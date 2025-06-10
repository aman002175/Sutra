
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
  userInput.value = "";
  showTypingIndicator();

  // ✅ Custom response
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("tumhara naam") ||
    lowerText.includes("tumhara naam kya hai") ||
    lowerText.includes("what is your name") ||
    lowerText.includes("tumhe kisne banaya") ||
    lowerText.includes("who made you")
  ) {
    const customReply = "मेरा नाम Sutra है। मुझे Aman bishnoi ने बनाया है। 😊";
    appendMessage(customReply, "bot");
    saveToHistory(customReply, "bot");
    chatBox.scrollTop = chatBox.scrollHeight;
    return;
  }

  fetch("https://sutra.onrender.com/chat", {
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
    sendMessage(); // ← यह लाइन जोड़ना ज़रूरी है
  };
}

userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});
// ✅ नया चैट शुरू करने का फंक्शन ऐड करें
function startNewChat() {
  localStorage.removeItem('chatHistory');
  document.getElementById('chatBox').innerHTML = '';
  
  // वेलकम मैसेज दिखाएं
  appendMessage("नमस्ते! मैं Sutra AI हूँ 😊<br/>नया चैट शुरू हुआ!", 'bot');
}

// ✅ चैट हिस्ट्री सेव करने का अपडेटेड फंक्शन
function saveToHistory(text, sender) {
  let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  history.push({ text, sender, timestamp: new Date().toISOString() });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

// ✅ पेज लोड पर हिस्ट्री लोड करें
window.onload = () => {
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  if(history.length === 0) {
    appendMessage("नमस्ते! मैं Sutra AI हूँ 😊<br/>आपका हिंदी सहायक!", 'bot');
  } else {
    history.forEach(msg => appendMessage(msg.text, msg.sender));
  }
};
