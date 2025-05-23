
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("paraphraser-form");
  const inputField = document.getElementById("original_text");
  const resultBox = document.getElementById("paraphrased_result");
  const loadingSpinner = document.getElementById("loading-spinner");

  form.addEventListener("submit", function (e) {
      e.preventDefault();

      const originalText = inputField.value.trim();
      if (!originalText) {
          alert("Please enter some text.");
          return;
      }

      resultBox.innerText = "";
      loadingSpinner.style.display = "block";

      fetch("/api/paraphraser/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: originalText })
      })
      .then(response => response.json())
      .then(data => {
          loadingSpinner.style.display = "none";
          if (data.response) {
              resultBox.innerText = data.response;
          } else {
              resultBox.innerText = "An error occurred. Please try again.";
          }
      })
      .catch(error => {
          loadingSpinner.style.display = "none";
          console.error("Error:", error);
          resultBox.innerText = "Something went wrong!";
      });
  });
});