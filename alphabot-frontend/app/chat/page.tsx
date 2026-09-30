"use client";

import { useEffect, useRef, useState } from "react";

import ChatHeader from "@/components/ChatHeader";
import ChatWelcome from "@/components/ChatWelcome";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatTyping from "@/components/ChatTyping";
import { APIError, apiFetch } from "@/lib/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type HistoryItem = {
  sender: string;
  text: string;
  timestamp?: string;
};

type Quota = {
  used: number;
  remaining: number;
  limit: number;
};

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [quota, setQuota] = useState<Quota | null>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------
  // Load chat history + quota
  // --------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const loadChat = async () => {
      try {
        setError(null);

        const [historyData, quotaData] = await Promise.all([
          apiFetch("/api/chat/history/"),
          apiFetch("/api/quota/"),
        ]);

        if (!isMounted) return;

        const history: HistoryItem[] = Array.isArray(
          historyData?.history
        )
          ? historyData.history
          : [];

        setMessages(
          history.map((message, index) => ({
            id: index + 1,
            role:
              message.sender === "AlphaBot"
                ? "assistant"
                : "user",
            content: message.text,
          }))
        );

        setQuota({
          used: Number(quotaData?.used ?? 0),
          remaining: Number(quotaData?.remaining ?? 0),
          limit: Number(quotaData?.limit ?? 0),
        });
      } catch (error) {
        if (!isMounted) return;

        if (
          error instanceof APIError &&
          (error.status === 401 ||
            error.status === 403)
        ) {
          window.location.href = "/login";
          return;
        }

        setError(
          getErrorMessage(
            error,
            "We couldn't load your chat. Please try again."
          )
        );
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
          setIsLoadingQuota(false);
        }
      }
    };

    loadChat();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------
  // Auto scroll
  // --------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // --------------------------------------------------------
  // Send message
  // --------------------------------------------------------

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || isLoading || isResetting) {
      return;
    }

    // Prevent unnecessary request if we already know
    // the daily limit has been reached.
    if (quota && quota.remaining <= 0) {
      setError(
        `You've reached your daily AI limit of ${quota.limit} requests. Please try again tomorrow.`
      );
      return;
    }

    setError(null);

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const data = await apiFetch("/api/chat/", {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      });

      const assistantResponse =
        data?.response ||
        data?.message ||
        "AlphaBot couldn't generate a response. Please try again.";

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: assistantResponse,
        },
      ]);

      // Update quota from the backend response.
      if (
        typeof data?.used !== "undefined" &&
        typeof data?.remaining !== "undefined" &&
        typeof data?.limit !== "undefined"
      ) {
        setQuota({
          used: Number(data.used),
          remaining: Number(data.remaining),
          limit: Number(data.limit),
        });
      }
    } catch (error) {
      if (
        error instanceof APIError &&
        (error.status === 401 ||
          error.status === 403)
      ) {
        setError(
          "Your session has expired. Please log in again to continue."
        );

        return;
      }

      if (
        error instanceof APIError &&
        error.status === 429
      ) {
        setError(
          error.message ||
            "You've reached your daily AI limit. Please try again tomorrow."
        );

        // Refresh quota so the UI knows the actual state.
        try {
          const quotaData = await apiFetch("/api/quota/");

          setQuota({
            used: Number(quotaData?.used ?? 0),
            remaining: Number(
              quotaData?.remaining ?? 0
            ),
            limit: Number(quotaData?.limit ?? 0),
          });
        } catch {
          // Keep the existing quota state if refresh fails.
        }

        return;
      }

      setError(
        getErrorMessage(
          error,
          "Something went wrong while contacting AlphaBot. Please try again."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------
  // New chat
  // --------------------------------------------------------

  const startNewChat = async () => {
    if (isLoading || isResetting) {
      return;
    }

    setError(null);
    setIsResetting(true);

    try {
      await apiFetch("/api/chat/reset/", {
        method: "POST",
      });

      setMessages([]);
      setInput("");
    } catch (error) {
      if (
        error instanceof APIError &&
        (error.status === 401 ||
          error.status === 403)
      ) {
        window.location.href = "/login";
        return;
      }

      setError(
        getErrorMessage(
          error,
          "We couldn't start a new chat. Please try again."
        )
      );
    } finally {
      setIsResetting(false);
    }
  };

  const limitReached =
    quota !== null && quota.remaining <= 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-6 pt-28 sm:px-6">

        <ChatHeader
          onNewChat={startNewChat}
          disabled={isResetting}
        />

        <div className="flex flex-1 flex-col">

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <span
                className="mt-0.5"
                aria-hidden="true"
              >
                ⚠️
              </span>

              <div className="flex-1">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-1 text-xs text-red-300 underline underline-offset-2 transition hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {isLoadingHistory ? (
            <div className="flex flex-1 items-center justify-center pb-20">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-400" />
                Loading your chat...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <ChatWelcome
              onSelectSuggestion={(suggestion) => {
                setError(null);
                setInput(suggestion);
              }}
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

          {/* Quota */}
          {!isLoadingQuota && quota && (
            <div className="mb-3 flex items-center justify-between px-1 text-xs text-zinc-600">
              <span>
                {quota.used} / {quota.limit} AI requests used today
              </span>

              <span
                className={
                  quota.remaining <= 3
                    ? "text-purple-300"
                    : "text-zinc-600"
                }
              >
                {quota.remaining} remaining
              </span>
            </div>
          )}

          {/* Chat input */}
          <ChatInput
            value={input}
            onChange={(value) => {
              setInput(value);

              if (value.trim()) {
                setError(null);
              }
            }}
            onSend={sendMessage}
            disabled={
              isLoading ||
              isResetting ||
              isLoadingHistory ||
              isLoadingQuota ||
              limitReached
            }
          />

          {limitReached && quota && (
            <p className="mt-2 text-center text-xs text-zinc-600">
              You've reached today's {quota.limit} AI request limit.
              Your limit resets tomorrow.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}