type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`message-in flex gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-lg font-semibold text-purple-400">
          α
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 ${
          isUser
            ? "bg-purple-500 text-white"
            : "border border-white/10 bg-white/[0.04] text-zinc-200 backdrop-blur-xl"
        }`}
      >
        <p className="whitespace-pre-wrap leading-7">
          {content}
        </p>
      </div>
    </div>
  );
}