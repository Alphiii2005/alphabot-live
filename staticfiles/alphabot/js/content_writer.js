document.getElementById("generate-content").addEventListener("click", () => {
  const topic = document.getElementById("topic-input").value.trim();
  const outputBox = document.getElementById("generated-content");
  const loading = document.getElementById("loading");

  if (!topic) {
      outputBox.innerText = "Please enter a topic.";
      return;
  }

  outputBox.innerHTML = "";
  loading.style.display = "block";

  fetch("/api/content/generate/", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({ topic: topic })
  })
  .then(res => res.json())
  .then(data => {
      loading.style.display = "none";
      if (data.response) {
          outputBox.innerHTML = marked.parse(data.response);

      } else {
          outputBox.innerText = data.error || "Something went wrong.";
      }
  })
  .catch(err => {
      loading.style.display = "none";
      outputBox.innerText = "Error: " + err;
  });
});

// Include this to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
          cookie = cookie.trim();
          if (cookie.startsWith(name + "=")) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


