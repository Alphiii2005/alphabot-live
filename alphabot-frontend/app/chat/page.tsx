"use client";

import { useEffect, useRef, useState } from "react";

import ChatHeader from "@/components/ChatHeader";
import ChatWelcome from "@/components/ChatWelcome";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatTyping from "@/components/ChatTyping";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
    });
  }, [messages, isLoading]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    // Temporary fake response
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm AlphaBot. Once we connect the Django backend, I'll be able to give you real AI responses here.",
        },
      ]);

      setIsLoading(false);
    }, 1200);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-28 pb-6 sm:px-6">

        <ChatHeader onNewChat={startNewChat} />

        <div className="flex flex-1 flex-col">
          {messages.length === 0 ? (
            <ChatWelcome
              onSelectSuggestion={setInput}
            />
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto pb-8">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}

              {isLoading && <ChatTyping />}

              <div ref={messagesEndRef} />
            </div>
          )}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </main>
  );
}