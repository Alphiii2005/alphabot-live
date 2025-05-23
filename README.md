# AlphaBot – Your AI Assistant Suite

## Overview

AlphaBot is an all-in-one AI-powered productivity web application built with Django and JavaScript. It empowers users to perform a variety of tasks including chatting with an AI assistant, generating CVs, writing content/scripts, paraphrasing text, and getting help with coding — all within one intuitive and mobile-responsive interface. 

This project was built as the final capstone for CS50’s Web Programming with Python and JavaScript.

---

## Distinctiveness and Complexity

AlphaBot stands out from the other CS50W projects in both **purpose and technical depth**. Unlike Project 2 (E-commerce) or Project 4 (Social Network), which are narrowly focused on specific models (users/products or users/posts), AlphaBot is a **modular AI toolkit** built from scratch that merges the power of **natural language processing** with a real-world application flow.

The project’s core distinctiveness lies in:

- **Multiple AI Features**: Not just one feature (like messaging or product listings), but six integrated tools, each powered by custom prompt engineering and AI responses: Chat, CV Generator, Script Writer, Content Writer, Paraphraser, and Code Assistant.
- **API Integration Struggles**: Originally, I planned to use OpenAI's API for all features. However, due to **pricing restrictions**, I went through multiple stages of iteration:
  - I tested **Hugging Face-hosted** models like `flan-t5-large` and `zephyr-7b-beta` for free-tier use.
  - Then I moved to **OpenRouter**, which gave access to a wider range of models including **DeepSeek V3** and **Meta’s LLaMA 4 Maverick** — providing both affordability and performance.
  - This required careful study of each provider’s docs, model response structure, and latency limits, which greatly influenced frontend rendering and backend handling logic.
- **Frontend-Backend Sync**: JavaScript is used heavily for:
  - Real-time chat interaction (using `fetch()` and dynamic DOM updates),
  - PDF generation via `html2pdf.js` and `jsPDF`,
  - Clipboard copy features for code responses,
  - Frontend animation with Animate.css.
- **Mobile-Responsive Design**: A fully custom CSS layout built from scratch with Tailwind-like principles, alongside Bootstrap 5 to ensure responsive behavior for mobile and tablet devices.

This project was not just technically challenging — it required *creative problem-solving*, *budget-aware planning*, and *iteration on open-source tools and APIs* to make the AI features feasible and performant on a free hosting environment.

---

## File Structure

