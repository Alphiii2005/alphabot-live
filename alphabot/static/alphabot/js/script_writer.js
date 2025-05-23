document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generate-script");
  const input = document.getElementById("script-input");
  const outputDiv = document.getElementById("generated-script");
  const loading = document.getElementById("loading");
  const downloadBtn = document.getElementById("download-pdf");

  generateBtn.addEventListener("click", async () => {
      const prompt = input.value.trim();
      if (!prompt) {
          alert("Please enter a script idea.");
          return;
      }

      loading.style.display = "block";
      outputDiv.innerHTML = "";
      downloadBtn.style.display = "none";

      try {
          const response = await fetch("/api/script/generate/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": getCookie("csrftoken"),
              },
              body: JSON.stringify({ prompt }),
          });

          const data = await response.json();
          loading.style.display = "none";

          if (data.response) {
              outputDiv.innerHTML = marked.parse(data.response); // <-- Markdown rendering
              downloadBtn.style.display = "inline-block";
          } else {
              outputDiv.textContent = "❌ Error generating script.";
          }
      } catch (err) {
          loading.style.display = "none";
          outputDiv.textContent = "⚠️ Server error.";
          console.error(err);
      }
  });

  downloadBtn.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const scriptContent = outputDiv.textContent;
      const lines = doc.splitTextToSize(scriptContent, 180);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.text(lines, 10, 20);

      doc.save("script.pdf");
  });

  // Utility to get CSRF token
  function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith(name + "=")) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }
});