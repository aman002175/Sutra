const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

// Utility: Sanitize text to avoid HTML injection (basic)
function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper: Replace "google" with "Sutra AI"
function replaceGoogleWithSutra(text) {
  return text.replace(/google/gi, "Sutra AI");
}

// Unified chat history loader
window.onload = () => {
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  if(history.length === 0) {
    appendMessage("नमस्ते! मैं Sutra AI हूँ 😊<br/>आपका हिंदी सहायक!", 'bot', true);
  } else {
    history.forEach(msg => appendMessage(msg.text, msg.sender, msg.isHtml));
  }
};

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(sanitize(text), 'user');
  saveToHistory(sanitize(text), 'user');
  userInput.value = "";
  showTypingIndicator();

  // Custom response
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("tumhara naam") ||
    lowerText.includes("tumhara naam kya hai") ||
    lowerText.includes("what is your name") ||
    lowerText.includes("tumhe kisne banaya") ||
    lowerText.includes("who made you")
  ) {
    let customReply = "मेरा नाम Sutra है। मुझे Aman bishnoi ने बनाया है। 😊";
    customReply = replaceGoogleWithSutra(customReply);
    appendMessage(customReply, "bot");
    saveToHistory(customReply, "bot");
    chatBox.scrollTop = chatBox.scrollHeight;
    removeTypingIndicator();
    return;
  }

  fetch("https://sutra.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
  .then(res => {
    if (!res.ok) throw new Error("Server Error");
    return res.json();
  })
  .then(data => {
    removeTypingIndicator();
    // Replace 'google' with 'Sutra AI' before showing bot reply
    const botReply = replaceGoogleWithSutra(sanitize(data.reply));
    appendMessage(botReply, 'bot');
    saveToHistory(botReply, 'bot');
    chatBox.scrollTop = chatBox.scrollHeight;
  })
  .catch(() => {
    removeTypingIndicator();
    const errorMsg = "❗ क्षमा करें, सर्वर से उत्तर नहीं मिला। कृपया बाद में प्रयास करें।";
    appendMessage(errorMsg, 'bot');
    saveToHistory(errorMsg, 'bot');
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function appendMessage(text, sender, isHtml = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  if(isHtml) {
    msgDiv.innerHTML = text;
  } else {
    msgDiv.textContent = text;
  }
  chatBox.appendChild(msgDiv);
}

function saveToHistory(text, sender, isHtml = false) {
  let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  history.push({ text, sender, timestamp: new Date().toISOString(), isHtml });
  localStorage.setItem('chatHistory', JSON.stringify(history));
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
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    appendMessage("❗ आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता।", 'bot');
    return;
  }
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'hi-IN';
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };
  recognition.onerror = function() {
    appendMessage("❗ वॉइस इनपुट में त्रुटि आई।", 'bot');
  };
}

userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendMessage();
});

// नया चैट शुरू करने का फंक्शन
function startNewChat() {
  // Get existing chat history
  const currentHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  if (currentHistory.length > 0) {
    // Get old chats array from localStorage (or empty)
    const oldChats = JSON.parse(localStorage.getItem('oldChats')) || [];
    // Add current chat to oldChats
    oldChats.push(currentHistory);
    // Save updated oldChats back to localStorage
    localStorage.setItem('oldChats', JSON.stringify(oldChats));
  }
  // Clear current chat history
  localStorage.removeItem('chatHistory');
  document.getElementById('chatBox').innerHTML = '';
  appendMessage("नमस्ते! मैं Sutra AI हूँ 😊<br/>नया चैट शुरू हुआ!", 'bot', true);
}

// चैट हिस्ट्री सेव करने और दिखाने का फंक्शन
function showChatHistory() {
  const oldChats = JSON.parse(localStorage.getItem("oldChats")) || [];
  if (oldChats.length === 0) {
    alert("कोई पुरानी चैट उपलब्ध नहीं है।");
    return;
  }
  let historyText = '';
  oldChats.forEach((chat, index) => {
    historyText += `📜 चैट #${index + 1}:\n`;
    chat.forEach(msg => {
      const who = msg.sender === 'user' ? '👤 आप' : '🤖 Sutra';
      historyText += `${who}: ${msg.text}\n`;
    });
    historyText += '\n-----------------------------\n\n';
  });
  const historyWindow = window.open("", "_blank", "width=400,height=600,scrollbars=yes");
  historyWindow.document.write(`<pre style="white-space: pre-wrap; font-family: sans-serif;">${historyText}</pre>`);
}
