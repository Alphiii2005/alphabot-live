document.addEventListener("DOMContentLoaded", async () => {
  const chatBox = document.getElementById("coder-box");
  const chatForm = document.getElementById("coder-form");
  const userMessageInput = document.getElementById("coder-user-message");
  const resetBtn = document.getElementById("reset-btn-coder");

  function appendMessage(sender, text, isMarkdown = false) {
  const div = document.createElement("div");
  div.className = `mb-3 ${sender === "user" ? "text-end" : "text-start"}`;

  if (isMarkdown && sender === "AlphaBot") {
    const html = marked.parse(text);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Add copy buttons to each <pre><code>
    tempDiv.querySelectorAll("pre").forEach((preBlock) => {
      const codeBlock = preBlock.querySelector("code");
      if (!codeBlock) return;

      const button = document.createElement("button");
      button.className = "btn btn-sm btn-outline-secondary mb-2 copy-btn";
      button.innerText = "📋 Copy";

      button.addEventListener("click", () => {
        navigator.clipboard.writeText(codeBlock.textContent.trim());
        button.innerText = "✅ Copied!";
        setTimeout(() => (button.innerText = "📋 Copy"), 2000);
      });

      preBlock.parentElement.insertBefore(button, preBlock);
    });

    const badge = document.createElement("span");
    badge.className = "badge bg-secondary";
    badge.textContent = `${sender}:`;

    div.appendChild(badge);
    div.appendChild(tempDiv);
  } else {
    div.innerHTML = `<span class="badge bg-${sender === "user" ? "primary" : "secondary"}">${sender}:</span> ${text}`;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}


  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator-coder";
    typingDiv.className = "text-start mb-2";
    typingDiv.innerHTML = `<span class="badge bg-secondary">AlphaBot:</span> <em>Typing...</em>`;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator-coder");
    if (typingDiv) typingDiv.remove();
  }

  try {
    const response = await fetch("/api/coder/chat/history/");
    const data = await response.json();
    if (data.history) {
      data.history.forEach((entry) => {
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
      const response = await fetch("/api/coder/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.response) {
        appendMessage("AlphaBot", data.response, true);
      } else {
        appendMessage("AlphaBot", "❌ Login required.");
      }
    } catch (err) {
      console.error(err);
      removeTypingIndicator();
      appendMessage("AlphaBot", "⚠️ Server error.");
    }
  });

  resetBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/api/coder/chat/reset/", {
        method: "POST",
      });
      const data = await response.json();
      if (data.status) {
        chatBox.innerHTML = "";
        appendMessage("AlphaBot", "🧹 Chat reset. Let’s start fresh!");
      }
    } catch (err) {
      console.error(err);
      appendMessage("AlphaBot", "❌ Couldn't reset chat.");
    }
  });
});
