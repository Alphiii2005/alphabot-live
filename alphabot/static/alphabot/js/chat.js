document.addEventListener("DOMContentLoaded", async () => {
    const chatBox = document.getElementById("chat-box");
    const chatForm = document.getElementById("chat-form");
    const userMessageInput = document.getElementById("chat-user-message");
    const resetBtn = document.getElementById("reset-btn");
  
    function appendMessage(sender, text, isMarkdown = false) {
        const div = document.createElement("div");
        div.className = `mb-2 ${sender === "user" ? "text-end" : "text-start"}`;
        if (isMarkdown && sender === "AlphaBot") {
            div.innerHTML = `<span class="badge bg-secondary">${sender}:</span> <div class="markdown">${marked.parse(text)}</div>`;
        } else {
            div.innerHTML = `<span class="badge bg-${sender === "user" ? "primary" : "secondary"}">${sender}:</span> ${text}`;
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.id = "typing-indicator-general";
        typingDiv.className = "text-start mb-2";
        typingDiv.innerHTML = `<span class="badge bg-secondary">AlphaBot:</span> <em>Typing...</em>`;
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function removeTypingIndicator() {
        const typingDiv = document.getElementById("typing-indicator-general");
        if (typingDiv) typingDiv.remove();
    }
  
    // Greet the user
    appendMessage("AlphaBot", "👋 Hi there! I'm AlphaBot. How can I help you today?", false);
  
    try {
        const response = await fetch("/api/chat/history/");
        const data = await response.json();
        if (data.history) {
            data.history.forEach(entry => {
                appendMessage(entry.sender, entry.text, entry.sender === "AlphaBot");
            });
        }
    } catch (err) {
        console.error("Failed to load chat history:", err);
    }
  
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = userMessageInput.value.trim();
        if (!message) return;
  
        appendMessage("user", message);
        userMessageInput.value = "";
        showTypingIndicator();
  
        try {
            const response = await fetch("/api/chat/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
  
            const data = await response.json();
            removeTypingIndicator();
  
            if (data.response) {
                appendMessage("AlphaBot", data.response, true);
            } else {
                appendMessage("AlphaBot", "Login to use AlphaBot.");
            }
        } catch (err) {
            console.error(err);
            removeTypingIndicator();
            appendMessage("AlphaBot", "Server error.");
        }
    });
  
    resetBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/chat/reset/", { method: "POST" });
            const data = await response.json();
            if (data.status) {
                chatBox.innerHTML = "";
                appendMessage("AlphaBot", "Chat memory cleared! ✨ Let's start fresh.");
            }
        } catch (err) {
            console.error(err);
            appendMessage("AlphaBot", "Couldn't reset chat 🤯");
        }
    });
  });
  