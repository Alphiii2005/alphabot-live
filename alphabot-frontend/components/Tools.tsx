"use client";

import { useEffect, useState } from "react";
import ToolCard from "./ToolsCard";

const tools = [
  {
    title: "AI Chat",
    description:
      "Chat with AlphaBot to explore ideas, solve problems and get things done.",
    icon: "•••",
    href: "/chat",
  },
  {
    title: "CV Creator",
    description:
      "Build a professional, ATS-friendly CV tailored to the role you're applying for.",
    icon: "CV",
    href: "/cv",
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
      <div className="mx-auto max-w-5xl">

        {/* Section heading */}
        <div className="mb-20 text-center">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/5 px-5 py-2 text-sm text-purple-300 backdrop-blur-xl">
            <span>✦</span>
            αlphaBot Tools
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
            Simple tools designed to help you turn ideas into something real.
          </p>

        </div>

        {/* Tool grid */}
        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
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