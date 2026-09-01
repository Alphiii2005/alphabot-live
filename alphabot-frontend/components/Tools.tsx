"use client";

import { useEffect, useState } from "react";
import ToolCard from "./ToolsCard";

const tools = [
  {
    title: "AI Chat",
    description: "Talk with AlphaBot and get help with almost anything.",
    icon: "•••",
    href: "/chat",
  },
  {
    title: "Coder",
    description:
      "Write, debug and understand code with your AI coding assistant.",
    icon: "</>",
    href: "/coder",
  },
  {
    title: "CV Generator",
    description:
      "Create professional and ATS-friendly CVs in seconds.",
    icon: "CV",
    href: "/cv",
  },
  {
    title: "Content Writer",
    description:
      "Turn ideas into articles, posts and useful written content.",
    icon: "✦",
    href: "/writer",
  },
  {
    title: "Script Writer",
    description:
      "Create scripts for YouTube videos, short films and more.",
    icon: "▶",
    href: "/script",
  },
  {
    title: "Paraphraser",
    description:
      "Rewrite and improve your text while keeping its meaning.",
    icon: "↻",
    href: "/paraphraser",
  },
];

const words = [
  "create.",
  "build.",
  "think.",
  "code.",
  "write.",
];

export default function Tools() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((current) => (current + 1) % words.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="tools"
      className="relative px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <div className="mb-20 text-center">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/5 px-5 py-2 text-sm text-purple-300 backdrop-blur-xl">
            <span>✦</span>
            AlphaBot Tools
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            One workspace to{" "}
            <span className="inline-block min-w-[150px] bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {words[wordIndex]}
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400">
            Everything you need to think, create, code and bring your ideas
            to life.
          </p>

        </div>

        {/* Tool grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
            />
          ))}
        </div>

      </div>
    </section>
  );
}