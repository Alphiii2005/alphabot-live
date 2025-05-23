document.addEventListener("DOMContentLoaded", () => {
  // Initialize variables
  const form = document.getElementById("cv-form");
  const steps = Array.from(form.querySelectorAll(".step"));
  const output = document.getElementById("cv-output");
  const progressBar = document.getElementById("progress-bar");
  let currentStep = 0;

  // Initialize animation library
  function animateStep(direction) {
      const current = steps[currentStep];
      const animationClass = direction === 'next' ? 'animate__fadeInRight' : 'animate__fadeInLeft';
      
      current.classList.remove('animate__fadeInLeft', 'animate__fadeInRight');
      current.classList.add('animate__animated', animationClass);
      
      setTimeout(() => {
          current.classList.remove('animate__animated', animationClass);
      }, 500);
  }

  // Update step visibility
  function updateStep() {
      steps.forEach((step, index) => {
          step.classList.toggle("active", index === currentStep);
      });
      
      // Update progress bar
      progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
      
      // Update button visibility
      document.getElementById("prev-step").style.display = currentStep === 0 ? "none" : "block";
      document.getElementById("next-step").style.display = currentStep === steps.length - 1 ? "none" : "block";
      document.getElementById("submit-btn").style.display = currentStep === steps.length - 1 ? "block" : "none";
  }

  // Field validation
  function validateCurrentStep() {
      const currentStepEl = steps[currentStep];
      const input = currentStepEl.querySelector("input, textarea");
      let isValid = true;

      if (input && input.required) {
          input.classList.remove("is-invalid");
          
          if (!input.value.trim()) {
              isValid = false;
              input.classList.add("is-invalid");
          } else if (input.id === "email" && !input.value.endsWith("@gmail.com")) {
              isValid = false;
              input.classList.add("is-invalid");
          } else if (input.id === "phone" && (!input.value.startsWith("07") || input.value.length !== 11)) {
              isValid = false;
              input.classList.add("is-invalid");
          } else if (input.id === "skills" && input.value.split(",").length < 3) {
              isValid = false;
              input.classList.add("is-invalid");
          }
      }
      
      return isValid;
  }

  // Navigation handlers
  document.getElementById("prev-step").addEventListener("click", () => {
      if (currentStep > 0) {
          currentStep--;
          animateStep('prev');
          updateStep();
      }
  });

  document.getElementById("next-step").addEventListener("click", () => {
      if (validateCurrentStep()) {
          currentStep++;
          animateStep('next');
          updateStep();
          calculateScore();
      }
  });

  // Calculate Success Score
  function calculateScore() {
      let score = 0;
      const fields = ["full-name", "email", "phone", "summary", "skills", "experience", "education"];
      
      // Basic completeness score
      fields.forEach(field => {
          const el = document.getElementById(field);
          if (el && el.value.trim()) score += 10;
      });
      
      // Quality adjustments
      const skillsEl = document.getElementById("skills");
      if (skillsEl && skillsEl.value.split(",").length > 5) score += 5;
      
      const experienceEl = document.getElementById("experience");
      if (experienceEl && experienceEl.value.length > 200) score += 10;
      
      score = Math.min(score, 95); // Cap at 95% without improvements
      
      // Update UI
      if (score > 0) {
          document.getElementById("score-placeholder").style.display = "none";
          document.getElementById("score-container").style.display = "block";
          document.getElementById("score-value").textContent = score;
          
          let feedback = "";
          if (score < 40) {
              feedback = "Your CV needs significant improvements";
          } else if (score < 70) {
              feedback = "Good start, but could be stronger";
          } else if (score < 85) {
              feedback = "Strong CV! Some minor improvements possible";
          } else {
              feedback = "Excellent CV! Ready to submit";
          }
          
          document.getElementById("score-feedback").innerHTML = `
              <p>${feedback}</p>
              <div class="progress">
                  <div class="progress-bar" style="width: ${score}%"></div>
              </div>`;
      }
  }

  // Form submission
  form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Validate all steps
      let allValid = true;
      for (let i = 0; i < steps.length; i++) {
          currentStep = i;
          if (!validateCurrentStep()) {
              allValid = false;
          }
      }
      currentStep = steps.length - 1;
      updateStep();

      if (!allValid) {
          output.innerHTML = `<div class="alert alert-danger">
              <i class="fas fa-exclamation-circle"></i> Please correct the highlighted fields
          </div>`;
          return;
      }

      output.innerHTML = `<div class="alert alert-info">
          <i class="fas fa-spinner fa-spin"></i> Generating your professional CV...
      </div>`;
      
      try {
          // Collect all form data
          const formData = {
              fullName: document.getElementById("full-name").value.trim(),
              email: document.getElementById("email").value.trim(),
              phone: document.getElementById("phone").value.trim(),
              summary: document.getElementById("summary").value.trim(),
              skills: document.getElementById("skills").value.trim(),
              experience: document.getElementById("experience").value.trim(),
              education: document.getElementById("education").value.trim()
          };

          // Send to backend for AI optimization
          const response = await fetch("/api/cv/generate/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": "{{ csrf_token }}"
              },
              body: JSON.stringify(formData)
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.error) {
              throw new Error(result.error);
          }

          // Display AI-optimized CV
          if (result.cv) {
              // If it looks like HTML, render as HTML, else parse as Markdown
              if (result.cv.trim().startsWith("<")) {
                  output.innerHTML = result.cv;
              } else {
                  output.innerHTML = marked.parse(result.cv);
              }
              document.getElementById("cv-action").style.display = "block";
          } else {
              output.innerHTML = `<div class="alert alert-danger">
                  <i class="fas fa-times-circle"></i> Error: CV content is missing from the server response.
              </div>`;
          }
          
          // Update score with AI-enhanced value
          document.getElementById("score-value").textContent = result.score || "85";
          document.getElementById("score-feedback").innerHTML = `
              <p>AI optimized your CV to <strong>${result.score || "85"}%</strong> effectiveness!</p>
              <div class="progress">
                  <div class="progress-bar bg-success" style="width: ${result.score || "85"}%"></div>
              </div>`;
          
      } catch (error) {
          output.innerHTML = `<div class="alert alert-danger">
              <i class="fas fa-times-circle"></i> Error: ${error.message}
          </div>`;
      }
  });

  // Download PDF
  document.getElementById("download-cv").addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      html2canvas(document.getElementById("cv-output")).then(canvas => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 10, 190, 0);
          doc.save("professional-cv.pdf");
      });
  });

  // Copy Text
  document.getElementById("copy-cv").addEventListener("click", () => {
      const range = document.createRange();
      range.selectNode(document.getElementById("cv-output"));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
      
      const alert = document.createElement("div");
      alert.className = "alert alert-success position-fixed top-0 end-0 m-3";
      alert.innerHTML = "<i class='fas fa-check'></i> CV copied to clipboard!";
      document.body.appendChild(alert);
      
      setTimeout(() => alert.remove(), 2000);
  });

  // Edit CV
  document.getElementById("edit-cv").addEventListener("click", () => {
      window.scrollTo({
          top: 0,
          behavior: "smooth"
      });
  });

  // Initialize
  updateStep();
});